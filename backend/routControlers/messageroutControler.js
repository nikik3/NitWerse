import Conversation from "../Models/conversationModels.js";
import Message from "../Models/messageSchema.js";
import Room from "../Models/roomModel.js";
import { getEmbedding } from "../services/embedding.js";
import { getReciverSocketId, io } from "../Socket/socket.js";

const DEFAULT_LIMIT = 50;

async function embedMessageAsync(messageId, text) {
    const { embedding, error } = await getEmbedding(text);
    if (embedding) {
        await Message.findByIdAndUpdate(messageId, { embedding });
    } else if (error) {
        console.error(`Failed to embed message ${messageId}:`, error);
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        const { id: receiverOrRoomId } = req.params;
        const { isRoom } = req.query;
        const senderId = req.user._id;

        let newMessages;

        if (isRoom === 'true') {
            const room = await Room.findById(receiverOrRoomId);
            if (!room) return res.status(404).send({ success: false, message: "Room not found" });

            if (!room.participants.some(p => p.toString() === senderId.toString())) {
                return res.status(403).send({ success: false, message: "You must join the room first" });
            }

            newMessages = new Message({
                senderId,
                message: messages,
                roomId: room._id
            });
            
            room.messages.push(newMessages._id);
            await Promise.all([room.save(), newMessages.save()]);

            io.to(room._id.toString()).emit("newMessage", newMessages);
            embedMessageAsync(newMessages._id, messages);

        } else {
            const reciverId = receiverOrRoomId;
            let chats = await Conversation.findOne({
                participants: { $all: [senderId, reciverId] }
            });

            if (!chats) {
                chats = await Conversation.create({
                    participants: [senderId, reciverId],
                });
            }

            newMessages = new Message({
                senderId,
                reciverId,
                message: messages,
                conversationId: chats._id
            });

            chats.messages.push(newMessages._id);
            await Promise.all([chats.save(), newMessages.save()]);

            const reciverSocketId = getReciverSocketId(reciverId);
            if (reciverSocketId) {
                io.to(reciverSocketId).emit("newMessage", newMessages);
            }
            embedMessageAsync(newMessages._id, messages);
        }

        res.status(201).send(newMessages);

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
        console.log(`error in sendMessage ${error}`);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: receiverOrRoomId } = req.params;
        const { isRoom, before, limit: limitParam } = req.query;
        const senderId = req.user._id;
        const limit = Math.min(parseInt(limitParam, 10) || DEFAULT_LIMIT, 100);

        let messageFilter;

        if (isRoom === 'true') {
            const room = await Room.findById(receiverOrRoomId);
            if (!room) return res.status(200).send({ messages: [], hasMore: false });
            
            if (!room.participants.some(p => p.toString() === senderId.toString())) {
                return res.status(403).send({ success: false, message: "You must join the room first" });
            }

            messageFilter = { roomId: room._id };
        } else {
            const reciverId = receiverOrRoomId;
            const chats = await Conversation.findOne({
                participants: { $all: [senderId, reciverId] }
            });

            if (!chats) return res.status(200).send({ messages: [], hasMore: false });

            messageFilter = { conversationId: chats._id };
        }

        if (before) {
            const cursorMessage = await Message.findById(before);
            if (cursorMessage) {
                messageFilter.createdAt = { $lt: cursorMessage.createdAt };
            }
        }

        const fetchedMessages = await Message.find(messageFilter)
            .sort({ createdAt: -1 })
            .limit(limit + 1);

        const hasMore = fetchedMessages.length > limit;
        const messages = fetchedMessages.slice(0, limit).reverse();

        return res.status(200).send({ messages, hasMore });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
        console.log(`error in getMessage ${error}`);
    }
};
