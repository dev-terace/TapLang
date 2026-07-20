import { prisma } from '../lib/prisma';

interface FindOrCreateInput {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  flag: string;
  statusMsg?: string;
}

const findOrCreateUser = async (userInput: FindOrCreateInput) => {
  // 1. providerId로 기존 유저 조회
  const existingUser = await prisma.myProfile.findUnique({
    where: {
      providerId: userInput.providerId,
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
      flag: userInput.flag,
      statusMsg: userInput.statusMsg,
    },
  });

  return { user: newUser, isNew: true };
};

export const userService = {
  findOrCreateUser,
};