import { postgresPrisma as prisma } from '../../lib/prisma';
import { getAuth, clerkClient } from "@clerk/express";
import { Request } from "express";

interface FindOrCreateInput {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  statusMsg?: string;
}

const findUserById = async (id: number) => {
  const user = await prisma.myProfile.findUnique({
    where: { id },
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

const findUserIdByProviderId = async (providerId: string) => {
  const user = await prisma.myProfile.findUnique({
    where: { providerId },
    select: { id: true },
  });

  return user?.id ?? null;
};

const findUserIdByAuthToken = async (req: Request): Promise<number> => {
  const { userId: providerId } = getAuth(req);

  if (!providerId) {
    throw new Error("인증 정보 없음");
  }

  let userId = await findUserIdByProviderId(providerId);

  // DB에 유저가 없으면 Clerk 정보를 가져와 즉시 생성
  if (!userId) {
    try {
      const clerkUser = await clerkClient.users.getUser(providerId);
      const primaryEmail =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || "";

      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "User";

      const { user } = await findOrCreateUser({
        provider: "clerk",
        providerId,
        email: primaryEmail,
        name,
      });

      userId = user.id;
    } catch (error) {
      // 동시 요청으로 다른 프로세스가 먼저 생성한 경우 재조회
      userId = await findUserIdByProviderId(providerId);
      if (!userId) {
        throw new Error("유저 생성 및 조회 실패");
      }
    }
  }

  return userId;
};

const findOrCreateUser = async (userInput: FindOrCreateInput) => {
  // 1. providerId로 기존 유저 조회
  const existingUser = await prisma.myProfile.findUnique({
    where: { providerId: userInput.providerId },
    select: {
      id: true,
      name: true,
      flag: true,
      email: true,
      statusMsg: true,
      showOnlineStatus: true,
    },
  });

  if (existingUser) {
    return { user: existingUser, isNew: false };
  }

  // 2. 신규 유저 태그 번호 생성 (#0부터 미사용 번호 탐색)
  const existingUsers = await prisma.myProfile.findMany({
    where: {
      name: { startsWith: `${userInput.name}#` },
    },
    select: { name: true },
  });

  const usedTags = new Set(
    existingUsers
      .map((u) => {
        const tagStr = u.name.split('#').pop();
        return tagStr !== undefined ? parseInt(tagStr, 10) : NaN;
      })
      .filter((tag) => !isNaN(tag))
  );

  let availableTag = 0;
  while (usedTags.has(availableTag)) {
    availableTag++;
  }

  const filterName = `${userInput.name}#${availableTag}`;

  // 3. 트랜잭션 처리 및 중복 생성 에러 예외 처리
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.myProfile.create({
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

      await tx.myProfileDetails.create({
        data: {
          profileId: createdUser.id,
          bio: '',
        },
      });

      return createdUser;
    });

    return { user: newUser, isNew: true };
  } catch (error) {
    // 경합 조건(Race Condition)으로 이미 유저가 생성된 경우 fallback 처리
    const fallbackUser = await prisma.myProfile.findUnique({
      where: { providerId: userInput.providerId },
      select: {
        id: true,
        name: true,
        flag: true,
        email: true,
        statusMsg: true,
        showOnlineStatus: true,
      },
    });

    if (fallbackUser) {
      return { user: fallbackUser, isNew: false };
    }

    throw error;
  }
};

export const userService = {
  findOrCreateUser,
  findUserIdByProviderId,
  findUserIdByAuthToken,
  findUserById,
};