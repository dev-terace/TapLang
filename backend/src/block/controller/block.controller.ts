import { Request, Response } from 'express';
import { blockUserService } from '../service/block.service';
import { userService } from '../../users/services/user.service';
import { emitReloadFriendsInfo } from '../../friends/socket/friends.handler';

export const requestBlockUser = async (req: Request, res: Response) => {
  try {
    // [주의] 실제 환경에서는 req.user.id 등 인증 미들웨어에서 로그인한 유저의 ID를 가져와야 합니다.
    const blockerId = await userService.findUserIdByAuthToken(req) 
    

    console.log("request block user", blockerId);
    // 클라이언트에서 보낸 차단할 대상의 ID
    const { blockedId } = req.body; 

    if (!blockerId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    if (!blockedId) {
      return res.status(400).json({ message: '차단할 사용자 ID가 필요합니다.' });
    }

    // 서비스 로직 호출
    const result = await blockUserService.requestBlockUser(Number(blockerId), Number(blockedId));
    emitReloadFriendsInfo(blockerId, blockedId)


    return res.status(200).json(result);
  } catch (error: any) {
    console.error('차단 처리 중 에러:', error);
    
    // 서비스에서 발생한 에러 메시지를 클라이언트로 전달
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};


export const getBlockedUsers = async (req: Request, res: Response) => {
  try {
    // 인증 미들웨어를 통해 설정된 로그인 유저 ID 추출
    const blockerId = await userService.findUserIdByAuthToken(req)

    if (!blockerId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const result = await blockUserService.getBlockedUsers(Number(blockerId));

    return res.status(200).json(result);
  } catch (error) {
    console.error('차단 목록 조회 오류:', error);

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};



export const unblockedUser = async (req: Request, res: Response) => {
  try {
    const blockerId = await userService.findUserIdByAuthToken(req);

    // 💡 axios의 { data: { blockedId } } 값이 req.body에 바인딩됩니다.
   
    const { blockedId } = req.query;

    if (!blockerId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    if (!blockedId) {
      return res.status(400).json({ message: '차단 해제할 사용자 ID가 필요합니다.' });
    }

    const result = await blockUserService.unblockUser(Number(blockerId), Number(blockedId));
    emitReloadFriendsInfo(Number(blockerId), Number(blockedId))

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('차단 해제 처리 중 에러:', error);

    if (error instanceof Error) {
      if (error.message.includes('찾을 수 없습니다')) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};