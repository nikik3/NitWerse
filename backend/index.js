import express from "express"
import dotenv from 'dotenv'
import dbConnect from "./DB/dbConnect.js";
import authRouter from  './rout/authUser.js'
import messageRouter from './rout/messageRout.js'
import userRouter from './rout/userRout.js'
import roomRouter from './rout/roomRout.js'
import searchRouter from './rout/searchRout.js'
import cookieParser from "cookie-parser";
import path from "path";

import {app , server} from './Socket/socket.js'

const __dirname = path.resolve();

dotenv.config();

app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/message',messageRouter)
app.use('/api/user',userRouter)
app.use('/api/room',roomRouter)
app.use('/api/search',searchRouter)

app.use(express.static(path.join(__dirname,"/frontend/dist")))

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        await dbConnect();

        server.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`Port ${PORT} is already in use. kill the other process or change PORT in .env`);
            } else {
                console.error("Server error:", error.message);
            }
            process.exit(1);
        });
    } catch (error) {
        process.exit(1);
    }
};

startServer();
