import { Router } from 'express';
import { createChat, createMessage } from '../controllers/chat.controller';

const router = Router();

router.post("/", createChat);
router.post("/message", createMessage)
export default router;