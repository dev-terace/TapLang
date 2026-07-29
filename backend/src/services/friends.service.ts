import { postgresPrisma as prisma } from "../lib/prisma";


const getFriends = async (ownId: number) => {
if (ownId == null) {
  throw new Error('ownId가 값이 없습니다.');
}

  const friends = await prisma.friends.findMany({
    where: {
      OR: [
        {
          ownId,
          friendId: {
            not: ownId,
          },
        },
        {
          friendId: ownId,
          ownId: {
            not: ownId,
          },
        },
      ],
    },
    select: {
      ownId: true,
      friendId: true,
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          flag: true,
          statusMsg: true,
        },
      },
    },
  });

  const uniqueFriends = Array.from(
    new Map(
      friends
        .filter((item) => item.friend.id !== ownId) // 본인 제외
        .map((item) => [item.friend.id, item.friend])
    ).values()
  );

  return uniqueFriends;
};





const addFriend = async (ownId: number, friendId: number) => {
  return await prisma.$transaction([
    prisma.friends.create({
      data: {
        ownId,
        friendId,
      },
    }),
    prisma.friends.create({
      data: {
        ownId: friendId,
        friendId: ownId,
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
