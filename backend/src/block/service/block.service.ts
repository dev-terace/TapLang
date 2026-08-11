import { postgresPrisma  } from "../../lib/prisma";

const prisma = postgresPrisma;



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
  // 1. 자기 자신을 차단하는지 확인
  if (blockerId === blockedId) {
    throw new Error('자기 자신을 차단할 수 없습니다.');
  }

  // 2. 차단할 대상이 존재하는지만 확인 (id만 조회하여 최적화)
  const targetUser = await prisma.myProfile.findUnique({
    where: { id: blockedId },
    select: { id: true },
  });

  if (!targetUser) {
    throw new Error('존재하지 않는 사용자입니다.');
  }

  // 3. 이미 차단한 상태인지 확인
  const existingBlock = await prisma.block.findUnique({
    where: {
      blockerId_blockedId: { blockerId, blockedId },
    },
  });

  if (existingBlock) {
    throw new Error('이미 차단한 사용자입니다.');
  }

  // 4. 트랜잭션: 차단 생성 + 기존 친구 관계 삭제 + 기존 친구 요청 삭제
  await prisma.$transaction(async (tx) => {
    // 4-1. 친구 관계 삭제 (A가 B이거나 B가 A인 경우 모두 고려)
    await tx.friends.deleteMany({
      where: {
        OR: [
          { userAId: blockerId, userBId: blockedId },
          { userAId: blockedId, userBId: blockerId },
        ],
      },
    });

    // 4-2. 진행 중인 친구 요청 삭제
    await tx.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: blockerId, receiverId: blockedId },
          { senderId: blockedId, receiverId: blockerId },
        ],
      },
    });

    // 4-3. 차단 데이터 생성
    await tx.block.create({
      data: {
        blockerId,
        blockedId,
      },
    });
  });

  // 5. 메시지만 반환
  return {
    message: '차단이 완료되었습니다.',
  };
};


export const getBlockedUsers = async (blockerId: number) => {
  // 1. 내가 차단한 유저 목록 조회 (최신 차단순)
  const blockedRecords = await prisma.block.findMany({
    where: {
      blockerId: blockerId,
    },
    include: {
      blocked: { // 차단당한 대상의 정보 가져오기
        select: {
          id: true,
          name: true,
          flag: true,
          statusMsg: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // 가장 최근에 차단한 사람부터 정렬
    },
  });

  // 2. 프론트엔드에서 사용하기 편하게 데이터 가공 (statusMsg -> statusMessage)
  const blockedUsers = blockedRecords.map((record) => ({
    id: record.blocked.id,
    name: record.blocked.name,
    flag: record.blocked.flag,
    statusMessage: record.blocked.statusMsg,
  }));

  return {
    message: '차단 목록을 성공적으로 불러왔습니다.',
    blockedUsers,
  };
};

export const blockUserService = {
    requestBlockUser,
    getBlockedUsers,
    unblockUser
}