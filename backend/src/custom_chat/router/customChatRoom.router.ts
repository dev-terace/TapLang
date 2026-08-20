import { Router } from "express";

import { joinCustomChat, joinConversation} from "../controller/customChatRoom.controller";

const router = Router();

// CUSTOM 채팅방 생성
router.post("/", joinCustomChat)
router.post("/join", joinConversation)

export default router;