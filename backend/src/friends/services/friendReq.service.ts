import { postgresPrisma as prisma } from "../../lib/prisma";


export const findRequestFriends = async (userId: number) => {
  const targetId = Number(userId); // 💡 string -> number 안전 변환

  const requests = await prisma.friendRequest.findMany({
    where: {
      OR: [
        { senderId: targetId },
        { receiverId: targetId },
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          flag: true,
        },
      },
      receiver: {
        select: {
          id: true,
          name: true,
          flag: true,
        },
      },
    },
  });

  return requests.map((request) => {
    // 💡 targetId와 비교하여 삼항/조건문 타입 비교 오작동 방지
    if (request.senderId === targetId) {
      // 내가 보낸 요청
      return {
        id: request.receiver.id,
        name: request.receiver.name,
        flag: request.receiver.flag,
        status: "SENT" as const,
      };
    }

    // 내가 받은 요청
    return {
      id: request.sender.id,
      name: request.sender.name,
      flag: request.sender.flag,
      status: "RECEIVED" as const,
    };
  });
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


const addFriend = async (ownId: number, friendId: number) => {
  const userAId = Math.max(ownId, friendId);
  const userBId = Math.min(ownId, friendId);

  return await prisma.$transaction([
    // 친구 관계 생성
    prisma.friends.create({
      data: {
        userAId,
        userBId,
      },
    }),

    // 친구 요청 삭제
    prisma.friendRequest.deleteMany({
      where: {
        senderId: friendId,
        receiverId: ownId,
      },
    }),
  ]);
};


export const deleteFriendRequest = async (
  ownId: number,
  friendId: number
) => {
  return await prisma.friendRequest.deleteMany({
    where: {
      senderId: ownId,
      receiverId: friendId,
    },
  });
};


export const friendReqService = {
  sendFriendRequest,
  findRequestFriends,
  addFriend,
  deleteFriendRequest
};