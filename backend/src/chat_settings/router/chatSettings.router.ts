import { Router } from 'express';
import { updateChatSettings, getChatSettings } from '../controller/chatSettings.controller';

const router = Router();

router.get("/", getChatSettings);
router.patch("/", updateChatSettings)

export default router;