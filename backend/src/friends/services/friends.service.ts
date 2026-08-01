import { postgresPrisma as prisma } from "../../lib/prisma";


const getFriends = async (ownId: number) => {
  if (ownId == null) {
    throw new Error('ownId가 값이 없습니다.');
  }

  const friends = await prisma.friends.findMany({
    where: {
      OR: [
        {
          userAId: ownId,
        },
        {
          userBId: ownId,
        },
      ],
    },
    select: {
      userAId: true,
      userBId: true,

      userA: {
        select: {
          id: true,
          name: true,
          flag: true,
          statusMsg: true,
        },
      },

      userB: {
        select: {
          id: true,
          name: true,
          flag: true,
          statusMsg: true,
        },
      },
    },
  });

  const friendList = friends.map((friend) =>
    friend.userAId === ownId
      ? friend.userB
      : friend.userA
  );

  return friendList;
};





const addFriend = async (ownId: number, friendId: number) => {
  const userAId = Math.max(ownId, friendId);
  const userBId = Math.min(ownId, friendId);

  return await prisma.$transaction([
    prisma.friends.create({
      data: {
        userAId,
        userBId,
      },
    }),
  ]);
};

const searchFriend = async (name: string) => {
  const friend = await prisma.myProfile.findUnique({
    where: {
      name,
    },
    select: {
      id: true,
      name: true,
      flag: true,
      statusMsg: true,
    },
  });

  return friend;
};


export const friendsService = {
  getFriends,
  addFriend,
  searchFriend
};
