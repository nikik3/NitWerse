import Conversation from "../Models/conversationModels.js";
import Message from "../Models/messageSchema.js";
import Room from "../Models/roomModel.js";
import { getReciverSocketId, io } from "../Socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        const { id: receiverOrRoomId } = req.params;
        const { isRoom } = req.query; // Add a query param ?isRoom=true
        const senderId = req.user._id;

        let newMessages;

        if (isRoom === 'true') {
            // Room messaging logic
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

            // Broadcast to everyone in the room
            io.to(room._id.toString()).emit("newMessage", newMessages);

        } else {
            // 1-on-1 messaging logic
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

            // Socket.io for 1-on-1
            const reciverSocketId = getReciverSocketId(reciverId);
            if (reciverSocketId) {
                io.to(reciverSocketId).emit("newMessage", newMessages);
            }
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
        const { isRoom } = req.query;
        const senderId = req.user._id;

        if (isRoom === 'true') {
            const room = await Room.findById(receiverOrRoomId).populate("messages");
            if (!room) return res.status(200).send([]);
            
            if (!room.participants.some(p => p.toString() === senderId.toString())) {
                return res.status(403).send({ success: false, message: "You must join the room first" });
            }

            return res.status(200).send(room.messages);
        } else {
            const reciverId = receiverOrRoomId;
            const chats = await Conversation.findOne({
                participants: { $all: [senderId, reciverId] }
            }).populate("messages");

            if (!chats) return res.status(200).send([]);
            return res.status(200).send(chats.messages);
        }
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
        console.log(`error in getMessage ${error}`);
    }
};
