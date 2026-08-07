import { Router } from 'express';
import { getConversationUnreadCounts, getMyConversations,  readConversation} from '../controllers/chat.controller';
const router = Router();

router.get("/", getMyConversations);
router.get("/unread-count", getConversationUnreadCounts)
router.patch("/unread-count/:conversationId", readConversation)
export default router;