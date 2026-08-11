import { Router } from 'express';
import {requestBlockUser, getBlockedUsers, unblockedUser} from '../controller/block.controller';
const router = Router();

router.post("/", requestBlockUser);
router.get("/", getBlockedUsers);
router.delete("/", unblockedUser)
export default router;