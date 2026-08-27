import { Request, Response } from "express";
import { findPeopleService } from "../service/findPeople.service";
import { userService } from "../../users/services/user.service";
export const findPeopleController = {
  async getPeopleList(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);

      if (!currentUserId) {
        return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
      }

      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
      const refresh = req.query.refresh === "true";

      const result = await findPeopleService.getPeopleList(
        currentUserId,
        page,
        limit,
        refresh
      );

      return res.status(200).json({
        success: true,
        data: result.users,
        meta: {
          page: result.page,
          total: result.total,          // 💡 추가
          totalPages: result.totalPages, // 💡 추가
          hasMore: result.hasMore,
        },
      });
    } catch (error) {
      console.error("[findPeopleController.getPeopleList Error]", error);
      return res.status(500).json({
        success: false,
        message: "사람 찾기 목록을 불러오는 중 오류가 발생했습니다.",
      });
    }
  },



  // 💡 비공개 상태 조회
  async getPrivacyStatus(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);
      if (!currentUserId) {
        return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
      }

      const isPrivate = await findPeopleService.getPrivacyStatus(currentUserId);
      return res.status(200).json({ success: true, isPrivate });
    } catch (error) {
      return res.status(500).json({ message: "상태 조회 중 오류가 발생했습니다." });
    }
  },

  // 💡 비공개 상태 변경
  async updatePrivacyStatus(req: Request, res: Response) {
    try {
      const currentUserId = await userService.findUserIdByAuthToken(req);
      if (!currentUserId) {
        return res.status(401).json({ message: "인증되지 않은 사용자입니다." });
      }

      const { isPrivate } = req.body;
      await findPeopleService.updatePrivacyStatus(currentUserId, Boolean(isPrivate));

      return res.status(200).json({
        success: true,
        message: `내 정보 숨기기 설정이 ${isPrivate ? '활성화' : '비활성화'}되었습니다.`,
      });
    } catch (error) {
      return res.status(500).json({ message: "상태 업데이트 중 오류가 발생했습니다." });
    }
  },
  
};