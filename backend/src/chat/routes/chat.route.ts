import { Router } from 'express';
import { createChat } from '../controllers/chat.controller';

const router = Router();

router.post("/", createChat);

export default router;