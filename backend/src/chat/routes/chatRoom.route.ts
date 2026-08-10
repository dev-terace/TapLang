import { Router } from 'express';
import { createChat, createMessage, getMessages, existsConversation, joinConversation } from '../controllers/chatRoom.controller';
const router = Router();

router.post("/", createChat);
router.post("/message", createMessage)

router.post("/join", joinConversation)

router.get(
  "/message/:conversationId/:createdAt?",
  getMessages
);

router.get(
  "/:conversationId",
  existsConversation
);


export default router;