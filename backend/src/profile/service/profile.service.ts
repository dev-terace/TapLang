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

export const profileService = {
    updateOnlineStatusVisibility
}