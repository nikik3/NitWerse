import express from "express";
import rateLimit from "express-rate-limit";
import isLogin from "../middleware/isLogin.js";
import { semanticSearch, searchStatus } from "../routControlers/searchController.js";

const router = express.Router();

const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { success: false, message: "Too many search requests. Try again in a minute." },
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

router.get("/status", isLogin, searchStatus);
router.get("/:id", isLogin, searchLimiter, semanticSearch);

export default router;
