import { Router } from "express";

import { joinCustomChat, joinConversation, transferOwner, kickMember} from "../controller/customChatRoom.controller";

const router = Router();

// CUSTOM 채팅방 생성
router.post("/", joinCustomChat)
router.post("/join", joinConversation)
router.patch("/:conversationId/owner", transferOwner)
router.delete("/:conversationId/members/:targetUserId", kickMember)

export default router;