import { prisma } from "../lib/prisma";


const getFriends = async (ownId: number) => {
  const friends = await prisma.friends.findMany({
    where: {
      ownId,
    },
    select: {
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

  return friends.map((f) => f.friend);
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
