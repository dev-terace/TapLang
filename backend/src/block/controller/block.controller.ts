import { Request, Response } from 'express';
import { blockUserService } from '../service/block.service';
import { userService } from '../../users/services/user.service';
import { emitReloadFriendsInfo } from '../../friends/socket/friends.handler';

export const requestBlockUser = async (req: Request, res: Response) => {
  try {
    const blockerId = await userService.findUserIdByAuthToken(req);
    const { blockedId } = req.body;

    if (!blockerId) {
      return res.status(401).json({ code: 'UNAUTHORIZED' });
    }

    if (!blockedId) {
      return res.status(400).json({ code: 'INVALID_REQUEST' });
    }

    const result = await blockUserService.requestBlockUser(Number(blockerId), Number(blockedId));
    emitReloadFriendsInfo(Number(blockerId), Number(blockedId));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('차단 처리 중 에러:', error);

    // 서비스에서 발생한 CustomError 처리 (code 반환)
    if (error.code) {
      return res.status(error.statusCode || 400).json({ code: error.code });
    }

    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getBlockedUsers = async (req: Request, res: Response) => {
  try {
    const blockerId = await userService.findUserIdByAuthToken(req);

    if (!blockerId) {
      return res.status(401).json({ code: 'UNAUTHORIZED' });
    }

    const result = await blockUserService.getBlockedUsers(Number(blockerId));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('차단 목록 조회 오류:', error);

    if (error.code) {
      return res.status(error.statusCode || 400).json({ code: error.code });
    }

    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    const blockerId = await userService.findUserIdByAuthToken(req);
    const { blockedId } = req.query;

    if (!blockerId) {
      return res.status(401).json({ code: 'UNAUTHORIZED' });
    }

    if (!blockedId) {
      return res.status(400).json({ code: 'INVALID_REQUEST' });
    }

    const result = await blockUserService.unblockUser(Number(blockerId), Number(blockedId));
    emitReloadFriendsInfo(Number(blockerId), Number(blockedId));

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('차단 해제 처리 중 에러:', error);

    if (error.code) {
      return res.status(error.statusCode || 400).json({ code: error.code });
    }

    return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR' });
  }
};

// 라우터 오탈자 호환용 alias
export const unblockedUser = unblockUser;