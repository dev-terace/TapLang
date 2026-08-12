import { Request, Response } from "express";
import { profileDetailService } from "../service/profile.details.service";
import { profileService } from "../service/profile.service";
import { userService } from "../../users/services/user.service";




export const updateOnlineStatusVisibility = async (
  req: Request,
  res: Response
) => {
  try {
    // 로그인한 사용자 ID
    const userId = await userService.findUserIdByAuthToken(req);

    if (!userId) {
      return res.status(401).json({
        message: "로그인이 필요합니다.",
      });
    }

    const { showOnlineStatus } = req.body;

    // boolean 검증
    if (typeof showOnlineStatus !== "boolean") {
      return res.status(400).json({
        message: "showOnlineStatus는 boolean이어야 합니다.",
      });
    }

    const result =
      await profileService.updateOnlineStatusVisibility(
        Number(userId),
        showOnlineStatus
      );

    return res.status(200).json({
      message: "온라인 상태 공개 설정이 변경되었습니다.",
      data: result,
    });
  } catch (error) {
    console.error(
      "updateOnlineStatusVisibility error:",
      error
    );

    return res.status(500).json({
      message: "온라인 상태 공개 설정 변경에 실패했습니다.",
    });
  }
};


export const getUserProfileDetails = async (req: Request, res: Response) => {
  try {

  
    const ownId = await userService.findUserIdByAuthToken(req);
    const userId = Number(req.params.userId);
    

    if (!ownId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const profile = await profileDetailService.getUserProfileDetails(userId);
    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('[getUserProfileSummary Error]:', error);
    return res.status(500).json({ error: error.message || '유저 프로필 조회 실패' });
  }
};

  export const getProfileDetails = async (req: Request, res: Response) => {
  try {

    // 1. 토큰을 통한 사용자 ID 조회 및 인증
    const ownId = await userService.findUserIdByAuthToken(req);
    if (!ownId) {
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    // 2. 서비스 레이어 호출
    const profileDetails = await profileDetailService.getMyProfileDetails(ownId);

    // 3. 성공 응답
    return res.status(200).json(profileDetails);
  } catch (error) {
    console.error('getProfileDetails 에러:', error);
    return res.status(500).json({ message: '프로필 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

  export const upsertProfileDetails = async(req: Request, res: Response) => {
    try {
       

      const ownId = await userService.findUserIdByAuthToken(req)
      if (!ownId) {
        return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      }

      // 2. 요청 Body 데이터 추출
      const { bio, spokenLangs, learningLangs, snsLinks } = req.body;

      // 3. 간단한 유효성 검증 (필요시 추가)
      if (!Array.isArray(spokenLangs) || !Array.isArray(learningLangs) || !Array.isArray(snsLinks)) {
        return res.status(400).json({ message: '올바르지 않은 데이터 형식입니다.' });
      }

      // 4. 서비스 레이어(Prisma 로직) 호출
      const updatedProfile = await profileDetailService.upsertMyProfileDetails(ownId, {
        bio,
        spokenLangs,
        learningLangs,
        snsLinks,
      });

      // 5. 성공 응답
      return res.status(200).json({
        message: '프로필이 성공적으로 업데이트되었습니다.',
        data: updatedProfile,
      });
    } catch (error) {
     
    }
  }
