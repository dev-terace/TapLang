import { Request, Response } from "express";
import { profileDetailService } from "../service/profile.details.service";
import { profileService } from "../service/profile.service";
import { userService } from "../../users/services/user.service";





export const checkUsernameTag = async (
  req: Request,
  res: Response,
) => {
  try {
    // GET Query 또는 POST Body에서 username 추출
    const username = req.query.username as string;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '아이디를 입력해주세요.',
      });
    }

    const result = await profileDetailService.checkUsernameTag(username);

    return res.status(200).json(result);
    ;
  } catch (error: any) {
    console.error('checkUsernameTag 에러:', error);
    return res.status(400).json({
      success: false,
      message: error.message || '태그 생성 중 오류가 발생했습니다.',
    });
  }
};

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
      const { userName, userNameTag, bio, spokenLangs, learningLangs, snsLinks } = req.body;

      // 3. 간단한 유효성 검증 (필요시 추가)
      if (!Array.isArray(spokenLangs) || !Array.isArray(learningLangs) || !Array.isArray(snsLinks)) {
        return res.status(400).json({ message: '올바르지 않은 데이터 형식입니다.' });
      }

      // 4. 서비스 레이어(Prisma 로직) 호출
      const updatedProfile = await profileDetailService.upsertMyProfileDetails(ownId, {
        userName,
        userNameTag,
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


  export const updateStatusMessage = async (req: Request, res: Response) => {
  try {
    // 💡 인증 미들웨어를 통해 주입된 사용자 ID라고 가정합니다 (req.user.id 등 프로젝트 환경에 맞게 수정)
    const userId = await userService.findUserIdByAuthToken(req) 
    const { message } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 상태 메시지 업데이트 실행 (메시지가 빈 문자열이면 지우는 것으로 처리)
    const updatedProfile = await profileService.updateStatusMessage(userId, message || null);

    res.status(200).json({ 
      success: true, 
      data: updatedProfile,
      message: '상태 메시지가 업데이트 되었습니다.' 
    });
  } catch (error) {
    console.error('상태 메시지 업데이트 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
};


export const checkAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = await userService.findUserIdByAuthToken(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "인증되지 않은 사용자입니다.",
      });
    }

    const result =
      await profileDetailService.checkDailyAttendance(userId);

    return res.status(200).json({
      success: true,
      checked: true,
      data: result ?? null,
    });

  } catch (error) {
    console.error(
      "[checkAttendance] 출석 체크 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "출석 체크에 실패했습니다.",
    });
  }
};
