// routes/findPeople.router.ts

import { Router } from "express";
import { findPeopleController } from "../controller/findPeople.controller";

const router = Router();

/**
 * @route   GET /api/find-people
 * @desc    사람 찾기 디렉토리 목록 조회 (온라인 70% / 오프라인 30% Redis 캐싱 세션 방식)
 * @query   page (기본값: 1), limit (기본값: 20), refresh (기본값: false)
 * @access  Private (로그인한 유저 전용)
 */

router.get("/",  findPeopleController.getPeopleList);

export default router;