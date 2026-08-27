import { Request, Response } from "express";
import { noticeService } from "../service/notice.service";
import { userService } from "../../users/services/user.service";

export const noticeController = {


    async checkAdmin(req: Request, res: Response) {
  try {
    const currentUserId = await userService.findUserIdByAuthToken(req);
    if (!currentUserId) {
      return res.status(200).json({ success: true, isAdmin: false });
    }

    const isAdmin = await noticeService.checkAdminPermission(currentUserId);
    return res.status(200).json({ success: true, isAdmin });
  } catch (error) {
    return res.status(200).json({ success: true, isAdmin: false });
  }
},

  async getNotices(req: Request, res: Response) {
    try {
      const notices = await noticeService.getNotices();
      return res.status(200).json({ success: true, data: notices });
    } catch (error) {
      return res.status(500).json({ message: "공지사항 조회 중 오류가 발생했습니다." });
    }
  },

  async createNotice(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);
      if (!currentUserId) return res.status(401).json({ message: "인증되지 않은 사용자입니다." });

      const { title, content, isUrgent } = req.body;
      const notice = await noticeService.createNotice(currentUserId, { title, content, isUrgent });

      return res.status(201).json({ success: true, data: notice });
    } catch (error: any) {
      if (error.message === "FORBIDDEN") {
        return res.status(403).json({ message: "공지사항 작성 권한이 없습니다." });
      }
      return res.status(500).json({ message: "공지사항 생성 오류" });
    }
  },

  async updateNotice(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);
      if (!currentUserId) return res.status(401).json({ message: "인증되지 않은 사용자입니다." });

      const noticeId = parseInt(req.params.id, 10);
      const { title, content, isUrgent } = req.body;

      const updated = await noticeService.updateNotice(currentUserId, noticeId, { title, content, isUrgent });

      return res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      if (error.message === "FORBIDDEN") {
        return res.status(403).json({ message: "공지사항 수정 권한이 없습니다." });
      }
      return res.status(500).json({ message: "공지사항 수정 오류" });
    }
  },

  async deleteNotice(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);
      if (!currentUserId) return res.status(401).json({ message: "인증되지 않은 사용자입니다." });

      const noticeId = parseInt(req.params.id, 10);
      await noticeService.deleteNotice(currentUserId, noticeId);

      return res.status(200).json({ success: true, message: "삭제되었습니다." });
    } catch (error: any) {
      if (error.message === "FORBIDDEN") {
        return res.status(403).json({ message: "공지사항 삭제 권한이 없습니다." });
      }
      return res.status(500).json({ message: "공지사항 삭제 오류" });
    }
  },
};