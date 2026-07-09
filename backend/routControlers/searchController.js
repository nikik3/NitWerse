import Conversation from "../Models/conversationModels.js";
import Message from "../Models/messageSchema.js";
import Room from "../Models/roomModel.js";
import { cosineSimilarity, getEmbedding, isEmbeddingEnabled } from "../services/embedding.js";

export const searchStatus = async (req, res) => {
    try {
        if (!isEmbeddingEnabled()) {
            return res.status(200).send({
                enabled: false,
                working: false,
                message: "OPENAI_API_KEY is not set on the server.",
            });
        }

        const { embedding, error } = await getEmbedding("health check");

        res.status(200).send({
            enabled: true,
            working: Boolean(embedding),
            message: embedding
                ? "OpenAI embeddings are working."
                : error || "OpenAI API call failed.",
        });
    } catch (error) {
        res.status(500).send({
            enabled: false,
            working: false,
            message: error.message || "Status check failed",
        });
    }
};

export const semanticSearch = async (req, res) => {
    try {
        const { id: conversationOrRoomId } = req.params;
        const { q, isRoom } = req.query;
        const senderId = req.user._id;

        if (!q?.trim()) {
            return res.status(400).send({ success: false, message: "Search query is required" });
        }

        if (!isEmbeddingEnabled()) {
            return res.status(503).send({
                success: false,
                message: "Semantic search is unavailable. Add OPENAI_API_KEY to enable it.",
            });
        }

        const { embedding: queryEmbedding, error: embedError } = await getEmbedding(q);
        if (!queryEmbedding) {
            return res.status(500).send({
                success: false,
                message: embedError || "Failed to process search query",
            });
        }

        let messageFilter;

        if (isRoom === "true") {
            const room = await Room.findById(conversationOrRoomId);
            if (!room) return res.status(404).send({ success: false, message: "Room not found" });

            if (!room.participants.some((p) => p.toString() === senderId.toString())) {
                return res.status(403).send({ success: false, message: "You must join the room first" });
            }

            messageFilter = { roomId: room._id, embedding: { $exists: true, $ne: [] } };
        } else {
            const chats = await Conversation.findOne({
                participants: { $all: [senderId, conversationOrRoomId] },
            });

            if (!chats) return res.status(200).send({ results: [] });

            messageFilter = { conversationId: chats._id, embedding: { $exists: true, $ne: [] } };
        }

        const messages = await Message.find(messageFilter)
            .populate("senderId", "username fullname")
            .sort({ createdAt: -1 });

        const results = messages
            .map((message) => ({
                _id: message._id,
                message: message.message,
                createdAt: message.createdAt,
                senderId: message.senderId,
                similarity: cosineSimilarity(queryEmbedding, message.embedding),
            }))
            .filter((result) => result.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10)
            .map((result) => ({
                ...result,
                similarityPercent: Math.round(result.similarity * 100),
            }));

        res.status(200).send({ results });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
        console.log(`error in semanticSearch ${error}`);
    }
};
