import { Router } from 'express';
import { createChat, createMessage } from '../controllers/chatRoom.controller';
import { getConversationUnreadCounts } from '../controllers/chat.controller';
const router = Router();

router.post("/", createChat);
router.post("/message", createMessage)
router.get("/unread-count", getConversationUnreadCounts)
export default router;