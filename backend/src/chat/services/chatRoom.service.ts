import { mongoPrisma, postgresPrisma } from "../../lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { ConversationMemberRole } from "../../../generated/mongo";

export const leaveConversation = async (
  conversationId: string,
  userId: number
) => {
  return mongoPrisma.$transaction(async (tx) => {
    /*
     * 1. 현재 사용자가 채팅방 멤버인지 확인
     */
    const member = await tx.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error("CONVERSATION_MEMBER_NOT_FOUND");
    }

    /*
     * 2. 채팅방 조회
     */
    const conversation = await tx.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
      },
    });

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND");
    }

    /*
     * 3. 사용자 본인의 ConversationMember 정보만 삭제
     */
    await tx.conversationMember.delete({
      where: {
        id: member.id,
      },
    });

    return {
      conversationId,
      deleted: false,
    };
  });
};

export const getConversationInfo = async (
  conversationId: string,
  userId: number
) => {
  const conversation = await mongoPrisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation) return null;

  // 1. 요청자(나)가 현재 방의 멤버인지 검증 (내가 방에 남아있는 한 true)
  const isMember = conversation.members.some((m) => m.userId === userId);
  if (!isMember) return null;

  // 2. 1:1 채팅인 경우 상대방 퇴장 여부 체크
  if (conversation.type === "DIRECT" && conversation.directKey) {
    const opponentId = conversation.directKey
      .split(":")
      .map(Number)
      .find((id) => id !== userId);

    const isOpponentInMembers = conversation.members.some(
      (m) => m.userId === opponentId
    );

    return {
      ...conversation,
      opponentInfo: {
        userId: opponentId,
        isLeft: !isOpponentInMembers, // true면 상대방이 나간 상태
      },
    };
  }

  // 3. 그룹 채팅인 경우 (1명만 남았을 때 포함)
  if (conversation.type === "GROUP") {
    const activeMemberCount = conversation.members.length;

    return {
      ...conversation,
      name: conversation.name || "(대화 상대 없음)",
      activeMemberCount, // 현재 방에 남아있는 인원수 (1명 남아있으면 1)
      isSoleMember: activeMemberCount === 1, // 혼자 남아있는지 여부
    };
  }

  return conversation;
};

export const getGroupChatMembers = async (conversationId: string) => {
  // MongoDB에서 대화방에 '현재 남아있는' 멤버들의 userId 추출
  const members = await mongoPrisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  if (members.length === 0) return [];

  const userIds = members.map((m) => m.userId);

  // PostgreSQL MyProfile 테이블에서 해당 유저들의 프로필 정보 조회
  const profiles = await postgresPrisma.myProfile.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      name: true,
      flag: true,
      statusMsg: true,
    },
  });

  return profiles;
};

export const existsConversation = async (conversationId: string) => {
  const conversation = await mongoPrisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    select: {
      id: true,
    },
  });

  return !!conversation;
};

export const getMessages = async (
  conversationId: string,
  cursor?: string
) => {
  if (!conversationId) {
    throw new Error("conversationId가 없습니다.");
  }

  const cursorDate =
    cursor && cursor !== "undefined"
      ? new Date(cursor)
      : new Date();

  const messages = await mongoPrisma.message.findMany({
    where: {
      conversationId,
      createdAt: {
        lt: cursorDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });

  const userIds = [...new Set(messages.map((m) => m.senderId))];

  const profiles = await postgresPrisma.myProfile.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      name: true,
      flag: true,
    },
  });

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile])
  );

  return messages.map((message) => {
    const profile = profileMap.get(message.senderId);

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      // ★ 나간 유저가 작성했던 메시지도 "(알 수 없음)" 또는 기본 이름으로 표시되도록 보완
      senderName: profile?.name ?? "(알 수 없음)",
      flag: profile?.flag ?? "",
      content: message.content,
      attachments: message.attachments,
      createdAt: message.createdAt.toISOString(),
    };
  });
};

export const existsConversationMember = async (
  conversationId: string,
  userId: number
) => {
  const member = await mongoPrisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  return !!member;
};

export interface Attachment {
  url: string;
  guid: string;
}

export const createMessage = async (
  conversationId: string,
  senderId: number,
  content: string,
  attachments?: Attachment[]
) => {
  if (!conversationId) {
    throw new Error("CONVERSATION_ID_REQUIRED");
  }

  if (!content?.trim() && !attachments?.length) {
    throw new Error("MESSAGE_CONTENT_REQUIRED");
  }

  const message = await mongoPrisma.$transaction(async (tx) => {
    // 1. 메시지 생성
    const message = await tx.message.create({
      data: {
        conversationId,
        senderId,
        content,
        attachments: attachments ?? null,
      },
    });

    // 2. 마지막 메시지 갱신
    await tx.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
      },
    });

    // 3. 나를 제외한 멤버 unread 증가 (혼자 남았을 때는 대상이 없어 0건 업데이트됨)
    await tx.conversationMember.updateMany({
      where: {
        conversationId,
        userId: {
          not: senderId,
        },
      },
      data: {
        unreadCount: {
          increment: 1,
        },
      },
    });

    return message;
  });

  const profile = await postgresPrisma.myProfile.findUnique({
    where: {
      id: senderId,
    },
    select: {
      name: true,
      flag: true,
    },
  });

  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    senderName: profile?.name ?? "(알 수 없음)",
    flag: profile?.flag ?? "",
    content: message.content,
    attachments: message.attachments,
    createdAt: message.createdAt.toISOString(),
  };
};

export const createChatInfo = async (
  memberIds: number[],
  ownId: number,
  chatType: "DIRECT" | "GROUP" ,
  name: string
) => {
  let conversation;
  const newMemberIds = [...memberIds];
  newMemberIds.push(ownId);

  if (newMemberIds.length !== 2 && chatType === "DIRECT") {
    throw new Error("잘못된 요청입니다!");
  }

  if (chatType === "DIRECT") {
    const receiverId = memberIds.find((id) => id !== ownId);

    if (receiverId === undefined) {
      throw new Error("상대방이 없습니다.");
    }

    conversation = await getOrCreateDirect(ownId, receiverId, name);
    return conversation;
  } else {
    if (name == null) {
      throw new Error("제목을 입력하세요.");
    }
    conversation = await createGroup(newMemberIds, ownId, name);
    return conversation;
  }
};

async function createGroup(
  memberIds: number[],
  ownId: number,
  name: string
) {
  return mongoPrisma.conversation.create({
    data: {
      id: uuidv7(),
      type: "GROUP",
      name: name,
      members: {
        create: memberIds.map((id) => ({
          userId: id,
          role: ConversationMemberRole.MEMBER,
        })),
      },
    },
  });
}

async function getOrCreateDirect(
  ownId: number,
  receiverId: number,
  name: string
) {
  if (ownId === receiverId) {
    throw new Error("same user");
  }

  const directKey = [ownId, receiverId]
    .sort((a, b) => a - b)
    .join(":");

  const existingConversation = await mongoPrisma.conversation.findFirst({
    where: { directKey },
  });

  if (existingConversation) {
    await mongoPrisma.$transaction([
      mongoPrisma.conversationMember.upsert({
        where: {
          conversationId_userId: {
            conversationId: existingConversation.id,
            userId: ownId,
          },
        },
        create: {
          conversationId: existingConversation.id,
          userId: ownId,
          role: ConversationMemberRole.MEMBER,
        },
        update: {},
      }),
      mongoPrisma.conversationMember.upsert({
        where: {
          conversationId_userId: {
            conversationId: existingConversation.id,
            userId: receiverId,
          },
        },
        create: {
          conversationId: existingConversation.id,
          userId: receiverId,
          role: ConversationMemberRole.MEMBER,
        },
        update: {},
      }),
    ]);

    return existingConversation;
  }

  try {
    return await mongoPrisma.conversation.create({
      data: {
        id: uuidv7(),
        type: "DIRECT",
        directKey,
        name,
        members: {
          create: [
            {
              userId: ownId,
              role: ConversationMemberRole.MEMBER,
            },
            {
              userId: receiverId,
              role: ConversationMemberRole.MEMBER,
            },
          ],
        },
      },
    });
  } catch (error: any) {
    if (
      error?.code === 11000 ||
      error?.message?.includes("duplicate key")
    ) {
      const conversation = await mongoPrisma.conversation.findFirst({
        where: { directKey },
      });

      if (conversation) {
        await mongoPrisma.$transaction([
          mongoPrisma.conversationMember.upsert({
            where: {
              conversationId_userId: {
                conversationId: conversation.id,
                userId: ownId,
              },
            },
            create: {
              conversationId: conversation.id,
              userId: ownId,
              role: ConversationMemberRole.MEMBER,
            },
            update: {},
          }),
          mongoPrisma.conversationMember.upsert({
            where: {
              conversationId_userId: {
                conversationId: conversation.id,
                userId: receiverId,
              },
            },
            create: {
              conversationId: conversation.id,
              userId: receiverId,
              role: ConversationMemberRole.MEMBER,
            },
            update: {},
          }),
        ]);

        return conversation;
      }
    }

    throw error;
  }
}

export const getMemberCount = async (conversationId: string) => {
  return await mongoPrisma.conversationMember.count({
    where: { conversationId },
  });
};




export const inviteMembers = async (
  conversationId: string,
  inviterIdInput: number,
  targetUserIdsInput: number | number[]
) => {
  const inviterId = Number(inviterIdInput);
  const targetUserIds = (
    Array.isArray(targetUserIdsInput) ? targetUserIdsInput : [targetUserIdsInput]
  ).map(Number);

  // 1. 대화방 및 기존 멤버 조회
  const conversation = await mongoPrisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: true },
  });

  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");
  if (conversation.type !== "GROUP") throw new Error("NOT_A_GROUP_CHAT");

  // 2. 초대 요청자가 현재 채팅방 멤버인지 검증
  const isInviterMember = conversation.members.some((m) => m.userId === inviterId);
  if (!isInviterMember) throw new Error("NOT_A_ROOM_MEMBER");

  // 3. 이미 참여 중인 멤버 제외 필터링
  const existingMemberIds = new Set(conversation.members.map((m) => m.userId));
  const newMemberIds = targetUserIds.filter((id) => !existingMemberIds.has(id));

  if (newMemberIds.length === 0) {
    throw new Error("ALREADY_MEMBERS");
  }

  // 4. 유저 정보 조회 (초대자 & 피초대자)
  // ※ RDB를 쓰신다면 prisma.user, MongoDB 통합이면 mongoPrisma.user 사용
  const [inviter, invitedUsers] = await Promise.all([
    postgresPrisma.myProfile.findUnique({
      where: { id: inviterId },
      select: { id: true, name: true, flag: true, statusMsg: true },
    }),
    postgresPrisma.myProfile.findMany({
      where: { id: { in: newMemberIds } },
      select: { id: true, name: true },
    }),
  ]);

  if (!inviter) throw new Error("INVITER_NOT_FOUND");

  // 5. 초대 안내 메시지 문구 생성 (예: "홍길동님이 김철수, 이영희님을 초대하셨습니다.")
  const invitedNames = invitedUsers.map((u) => u.name).join(", ");
  const systemContent = `${inviter.name}님이 ${invitedNames}님을 초대하셨습니다.`;

  // 6. DB 트랜잭션 (멤버 추가 & 시스템 메시지 저장)
  const [, systemMessage] = await mongoPrisma.$transaction([
    // 6-1. 신규 멤버 추가
    mongoPrisma.conversationMember.createMany({
      data: newMemberIds.map((userId) => ({
        conversationId,
        userId,
        role: ConversationMemberRole.MEMBER,
      })),
    }),
    // 6-2. 초대 시스템 메시지 생성 및 DB 저장
    mongoPrisma.message.create({
      data: {
        conversationId,
        senderId: inviterId,
        content: systemContent,
        // 필요 시 시스템 메시지 타입 지정 (예: type: "SYSTEM")
      },
    }),
  ]);

  // 7. 컨트롤러의 emitNewMessage에서 사용할 데이터 반환
  return {
    conversationId,
    invitedUserIds: newMemberIds,
    conversationName: conversation.name || "그룹 채팅",
    inviter: {
      id: inviter.id,
      name: inviter.name,
      flag: inviter.flag || "kr",
      statusMsg: inviter.statusMsg || null,
    },
    systemMessage: {
      id: systemMessage.id,
      content: systemMessage.content,
      createdAt: systemMessage.createdAt.toISOString(),
    },
  };
};

export const chatRoomService = {
  createChatInfo,
  createMessage,
  existsConversationMember,
  getMessages,
  existsConversation,
  getGroupChatMembers,
  getConversationInfo,
  leaveConversation,
  getMemberCount,
  inviteMembers
};