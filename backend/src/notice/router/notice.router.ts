import { Router } from "express";
import { noticeController } from "../controller/notice.controller";

const noticeRouter = Router();

// 공지사항 전체 목록 조회
noticeRouter.get("/", noticeController.getNotices);

noticeRouter.get("/admin", noticeController.checkAdmin);

// 공지사항 작성 (권한 검증은 Controller/Service 내부에서 수행)
noticeRouter.post("/", noticeController.createNotice);

// 공지사항 수정
noticeRouter.put("/:id", noticeController.updateNotice);

// 공지사항 삭제
noticeRouter.delete("/:id", noticeController.deleteNotice);



export default noticeRouter;