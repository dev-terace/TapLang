import { postgresPrisma as prisma } from "../../lib/prisma";


export const findRequestFriends = async (userId: number) => {
  
const requests = await prisma.friendRequest.findMany({
  where: {
    OR: [
      { senderId: userId },
    ],
  },
  include: {
    receiver: {
        select: {
          id: true,
          name: true,
          flag: true,
        },
      },
  },
});

const result = requests.map((request) =>
  request.senderId === userId
    ? request.receiver
    : request.sender
);


  return result;
};


const sendFriendRequest = async (
  senderId: number,
  receiverId: number
) => {
  return await prisma.$transaction(async (tx) => {

    const userAId = Math.max(senderId, receiverId);
    const userBId = Math.min(senderId, receiverId);


    const friend = await tx.friends.findUnique({
      where: {
        userAId_userBId: {
          userAId: userAId,
          userBId: userBId,
        },
      },
    });

    if (friend) {
    
      throw new Error("이미 친구입니다.");
    }

    const request = await tx.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (request) {
      throw new Error("이미 친구 요청을 보냈습니다.");
    }

    // 친구 요청 생성
    await tx.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });

    // 친구 정보 반환
    return await tx.myProfile.findUnique({
      where: {
        id: receiverId,
      },
      select: {
        id: true,
        name: true,
        flag: true,
      },
    });
  });
};

export const friendReqService = {
  sendFriendRequest,
  findRequestFriends
};