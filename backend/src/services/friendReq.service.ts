import { prisma } from "../lib/prisma";


export const findRequestFriends = async (userId: number) => {
  
const requests = await prisma.friendRequest.findMany({
  where: {
    OR: [
      { senderId: userId },
    ],
  },
  include: {
    receiver: true,
  },
});

const result = requests.map((request) => 
  ({
  profile:
    request.senderId === userId
      ? request.receiver
      : request.sender,
}));

  return result;
};


const sendFriendRequest = async (
  senderId: number,
  receiverId: number
) => {
  return await prisma.$transaction(async (tx) => {
    const friend = await tx.friends.findUnique({
      where: {
        ownId_friendId: {
          ownId: senderId,
          friendId: receiverId,
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
        statusMsg: true,
      },
    });
  });
};

export const friendReqService = {
  sendFriendRequest,
  findRequestFriends
};