import { Router } from "express";

import { joinCustomChat} from "../controller/customChatRoom.controller";

const router = Router();

// CUSTOM 채팅방 생성
router.post("/", joinCustomChat)


export default router;