import { postgresPrisma } from "../../lib/prisma";

export const updateOnlineStatusVisibility = async (
  userId: number,
  showOnlineStatus: boolean
) => {
  return postgresPrisma.myProfile.update({
    where: {
      id: userId,
    },
    data: {
      showOnlineStatus,
    },
    select: {
      id: true,
      showOnlineStatus: true,
    },
  });
};


export const updateStatusMessage = async (userId: number, message: string) => {
  // MyProfile 테이블의 statusMsg 업데이트
  const updatedProfile = await postgresPrisma.myProfile.update({
    where: { 
      id: userId 
    },
    data: { 
      statusMsg: message 
    },
    select: {
      id: true,
      name: true,
      statusMsg: true, // 필요한 정보만 반환
    }
  });

  return updatedProfile;
};

export const profileService = {
    updateOnlineStatusVisibility,
    updateStatusMessage
}