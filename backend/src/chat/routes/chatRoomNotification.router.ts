import { Router } from 'express';
import {
  getNotification,
  updateNotification,
  toggleNotification
} from '../controllers/chatRoomNotification.controller';

const router = Router();


// 특정 채팅방 알림 설정 조회
router.get("/:conversationId", getNotification);

// 특정 채팅방 알림 ON / OFF
router.patch("/:conversationId", updateNotification);

// 특정 채팅방 알림 토글
router.patch("/:conversationId/toggle", toggleNotification);

export default router;