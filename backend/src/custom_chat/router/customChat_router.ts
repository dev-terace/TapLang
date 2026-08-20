import { Router } from "express";

import { createCustomChat, getCustomChats } from "../controller/customChat.controller";

const router = Router();

// CUSTOM 채팅방 생성
router.get("/", getCustomChats)
router.post(
  "/",
  createCustomChat
);


export default router;