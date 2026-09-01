import { postgresPrisma } from "../../lib/prisma";

const prisma = postgresPrisma;

// 파일 내부에 선언한 CustomError 클래스
class CustomError extends Error {
  constructor(
    public code: string,
    public statusCode: number = 400,
    message?: string
  ) {
    super(message || code);
    this.name = "CustomError";
  }
}

export const unblockUser = async (blockerId: number, blockedId: number) => {
  return await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId: Number(blockerId),
        blockedId: Number(blockedId),
      },
    },
  });
};

export const requestBlockUser = async (blockerId: number, blockedId: number) => {
  const bId = Number(blockerId);
  const targetId = Number(blockedId);

  // 1. 자기 자신 차단 검증
  if (bId === targetId) {
    throw new CustomError("CANNOT_BLOCK_SELF", 400);
  }

  // 2. 대상 존재 여부 확인
  const targetUser = await prisma.myProfile.findUnique({
    where: { id: targetId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new CustomError("USER_NOT_FOUND", 404);
  }

  // 3. 이미 차단했는지 확인
  const existingBlock = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: { blockerId: bId, blockedId: targetId },
    },
  });

  if (existingBlock) {
    throw new CustomError("ALREADY_BLOCKED", 400);
  }

  // 4. 트랜잭션: 차단 생성 + 관계/요청 삭제
  await prisma.$transaction(async (tx) => {
    await tx.friends.deleteMany({
      where: {
        OR: [
          { userAId: bId, userBId: targetId },
          { userAId: targetId, userBId: bId },
        ],
      },
    });

    await tx.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: bId, receiverId: targetId },
          { senderId: targetId, receiverId: bId },
        ],
      },
    });

    await tx.block.create({
      data: {
        blockerId: bId,
        blockedId: targetId,
      },
    });
  });

  // 5. 메시지 대신 코드 반환
  return {
    success: true,
    code: "BLOCK_SUCCESS",
  };
};

export const getBlockedUsers = async (blockerId: number) => {
  const blockedRecords = await prisma.block.findMany({
    where: {
      blockerId: Number(blockerId),
    },
    include: {
      blocked: {
        select: {
          id: true,
          name: true,
          flag: true,
          statusMsg: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const blockedUsers = blockedRecords.map((record) => ({
    id: record.blocked.id,
    name: record.blocked.name,
    flag: record.blocked.flag,
    statusMessage: record.blocked.statusMsg,
  }));

  return {
    blockedUsers,
  };
};

export const blockUserService = {
  requestBlockUser,
  getBlockedUsers,
  unblockUser,
};