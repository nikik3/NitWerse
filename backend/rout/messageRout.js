import express from "express"
import rateLimit from "express-rate-limit";
import { getMessages, sendMessage } from "../routControlers/messageroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

const sendMessageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { success: false, message: "Too many messages sent. Slow down and try again." },
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

router.post('/send/:id', isLogin, sendMessageLimiter, sendMessage)

router.get('/:id', isLogin, getMessages);

export default router
