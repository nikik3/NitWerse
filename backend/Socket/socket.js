import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const allowedOrigins = [
    'http://localhost:5173',
    'https://nitwerse.onrender.com',
    process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server,{
    cors:{
        origin: allowedOrigins,
        methods:["GET","POST"],
        credentials: true,
    }
});

export const getReciverSocketId = (receverId)=>{
    return userSocketmap[receverId];
};

const userSocketmap={}; //{userId,socketId}
io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId;

    if(userId !== "undefined") userSocketmap[userId] = socket.id;
    io.emit("getOnlineUsers",Object.keys(userSocketmap))

    // Handle joining a room for group chats
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
    });

    socket.on('disconnect',()=>{
        delete userSocketmap[userId],
        io.emit('getOnlineUsers',Object.keys(userSocketmap))
    });
});

export {app , io , server}