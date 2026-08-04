import { Router } from 'express';
import { getConversationUnreadCounts, getMyConversations } from '../controllers/chat.controller';
const router = Router();

router.get("/", getMyConversations);
router.get("/unread-count", getConversationUnreadCounts)
export default router;