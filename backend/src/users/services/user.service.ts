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
      showOnlineStatus: true,
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
      statusMsg: true,
      showOnlineStatus: true,
    },
  });

  // 2. 유저가 이미 존재하면 기존 유저 반환 (isNew: false)
  if (existingUser) {
    return { user: existingUser, isNew: false };
  }

  // 3. 신규 유저 태그 번호 생성 (#0부터 빈 번호 차곡차곡 채우기)
  const existingUsers = await prisma.myProfile.findMany({
    where: {
      name: {
        startsWith: `${userInput.name}#`,
      },
    },
    select: {
      name: true,
    },
  });

  // 사용 중인 태그 번호 추출
  const usedTags = new Set(
    existingUsers
      .map((u) => {
        const tagStr = u.name.split('#').pop();
        return tagStr !== undefined ? parseInt(tagStr, 10) : NaN;
      })
      .filter((tag) => !isNaN(tag))
  );

  // #0부터 가장 작은 미사용 태그 번호 탐색
  let availableTag = 0;
  while (usedTags.has(availableTag)) {
    availableTag++;
  }

  const filterName = `${userInput.name}#${availableTag}`;

  // 4. 유저 생성
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
      showOnlineStatus: true,
    },
  });

  const newId = newUser.id;
  await prisma.myProfileDetails.create({
    data: {
      profileId: newId,
      bio: '',
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