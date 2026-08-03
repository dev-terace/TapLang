import { postgresPrisma as prisma } from '../../lib/prisma';
import { getAuth } from "@clerk/express";
import { Request } from "express";
interface FindOrCreateInput {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  statusMsg?: string;
}


const findUserById = async (
  id: number
) => {
  const user = await prisma.myProfile.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      flag: true,
      statusMsg: true,
    },
  });

  return user ?? null;
};

const findUserIdByProviderId = async (
  providerId: string
) => {

  const user = await prisma.myProfile.findUnique({
    where: {
      providerId,
    },
    select: {
      id: true,
    },
  });


  return user?.id ?? null;
};

const findUserIdByAuthToken = async(req: Request): Promise<number> => {
  const { userId: providerId } = getAuth(req);

  if (!providerId) {
    throw new Error("인증 정보 없음");
  }

  const userId = await findUserIdByProviderId(providerId);

  if (!userId) {
    throw new Error("유저 없음");
  }

  return userId;
};

const findOrCreateUser = async (userInput: FindOrCreateInput) => {
  // 1. providerId로 기존 유저 조회
const existingUser = await prisma.myProfile.findUnique({
    where: {
      providerId: userInput.providerId,
    },
    select: {
      id: true,
      name: true,
      flag: true,
      email: true,
      statusMsg: true
  },
});

  // 2. 유저가 이미 존재하면 기존 유저 반환 (isNew: false)
  if (existingUser) {
    return { user: existingUser, isNew: false };
  }

  // 3. 존재하지 않는 신규 유저라면 name#count 로직 적용 후 생성 (isNew: true)
  const nameCount = await prisma.myProfile.count({
    where: { name: userInput.name },
  });

  const filterName = `${userInput.name}#${nameCount}`;

  const newUser = await prisma.myProfile.create({
    data: {
      provider: userInput.provider,
      providerId: userInput.providerId,
      email: userInput.email,
      name: filterName,
      flag: "un",
      statusMsg: userInput.statusMsg,
    },
    select: {
      id: true,
      name: true,
      flag: true,
      email: true,
      statusMsg: true,
    },
});

return {
  user: newUser,
  isNew: true,
};


};

export const userService = {
  findOrCreateUser,
  findUserIdByProviderId,
  findUserIdByAuthToken,
  findUserById
};