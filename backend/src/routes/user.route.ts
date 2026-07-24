import { Router } from 'express';
import { loginOrRegister } from '../controllers/user.controller';

const router = Router();

// POST /api/users/login -> 없으면 가입(201), 있으면 로그인(200)
router.post("/", loginOrRegister);


export default router;