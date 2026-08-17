import { Router } from 'express';
import { createChat, createMessage, getMessages, 
        existsConversation, joinConversation, getGroupChatMembers
        , getConversationInfo, leaveConversation } from '../controllers/chatRoom.controller';
const router = Router();

router.post("/", createChat);
router.post("/message", createMessage)

router.post("/join", joinConversation)

router.get("/group/:conversationId", getGroupChatMembers)

router.get(
  "/message/:conversationId/:createdAt?",
  getMessages
);

router.get(
  "/:conversationId",
  existsConversation
);

router.delete(
  '/:conversationId',
  leaveConversation,
)

router.get(
  "/info/:conversationId",
  getConversationInfo
);




export default router;