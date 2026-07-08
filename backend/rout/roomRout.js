import express from 'express';
import isLogin from '../middleware/isLogin.js';
import { createRoom, getRooms, joinRoom } from '../routControlers/roomController.js';

const router = express.Router();

router.post('/create', isLogin, createRoom);
router.get('/all', isLogin, getRooms);
router.post('/:roomId/join', isLogin, joinRoom);

export default router;
