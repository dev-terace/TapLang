import { Router } from 'express';
import { createChat, createMessage, getMessages } from '../controllers/chatRoom.controller';
const router = Router();

router.post("/", createChat);
router.post("/message", createMessage)
router.get(
  "/message/:conversationId/:createdAt?",
  getMessages
);
export default router;