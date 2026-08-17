import { mongoPrisma, postgresPrisma } from "../../lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { ConversationMemberRole } from "../../../generated/mongo";





//memberIds 값의 ownId가 포함 됨

export const leaveConversation = async (
  conversationId: string,
  userId: number
) => {

  return mongoPrisma.$transaction(async (tx) => {

    /*
     * 1. 현재 사용자가 채팅방 멤버인지 확인
     */
    const member =
      await tx.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
      });

    if (!member) {
      throw new Error(
        "CONVERSATION_MEMBER_NOT_FOUND"
      );
    }


    /*
     * 2. 채팅방 조회
     */
    const conversation =
      await tx.conversation.findUnique({
        where: {
          id: conversationId,
        },
        select: {
          id: true,
          type: true,
        },
      });

    if (!conversation) {
      throw new Error(
        "CONVERSATION_NOT_FOUND"
      );
    }


    /*
     * ========================================
     * DIRECT
     * ========================================
     *
     * 1:1 채팅은 한 명이 나가면
     * 채팅방 자체를 삭제한다.
     *
     * 삭제 순서:
     *
     * Message
     *     ↓
     * ConversationMember
     *     ↓
     * Conversation
     */
    if (conversation.type === "DIRECT") {

      /*
       * 3. 메시지 전체 삭제
       */
      await tx.message.deleteMany({
        where: {
          conversationId,
        },
      });


      /*
       * 4. 모든 채팅방 멤버 삭제
       *
       * 나간 사용자뿐만 아니라
       * 상대방의 ConversationMember도 삭제
       */
      await tx.conversationMember.deleteMany({
        where: {
          conversationId,
        },
      });


      /*
       * 5. Conversation 삭제
       */
      await tx.conversation.delete({
        where: {
          id: conversationId,
        },
      });


      return {
        conversationId,
        deleted: true,
      };
    }


    /*
     * ========================================
     * GROUP
     * ========================================
     */

    /*
     * 6. 현재 멤버 수 확인
     */
    const memberCount =
      await tx.conversationMember.count({
        where: {
          conversationId,
        },
      });


    /*
     * 7. 마지막 멤버가 나가는 경우
     *
     * Message
     * ConversationMember
     * Conversation
     * 전부 삭제
     */
    if (memberCount === 1) {

      /*
       * 메시지 삭제
       */
      await tx.message.deleteMany({
        where: {
          conversationId,
        },
      });


      /*
       * 마지막 멤버 삭제
       */
      await tx.conversationMember.delete({
        where: {
          id: member.id,
        },
      });


      /*
       * 채팅방 삭제
       */
      await tx.conversation.delete({
        where: {
          id: conversationId,
        },
      });


      return {
        conversationId,
        deleted: true,
      };
    }


    /*
     * 8. 일반 GROUP 탈퇴
     *
     * 방은 유지하고
     * 현재 사용자만 멤버에서 제거
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

  const conversation =
    await mongoPrisma.conversation.findUnique({
      where: {
        id: conversationId,
      },

      include: {
        members: true,
      },
    });

  if (!conversation) {
    return null;
  }

  // 현재 사용자가 이 채팅방의 멤버인지 확인
  const isMember =
    conversation.members.some(
      member => member.userId === userId
    );

  if (!isMember) {
    return null;
  }

  return conversation;
};


  export const getGroupChatMembers = async(conversationId: string) => {
    // 1. MongoDB에서 대화방 멤버들의 userId 추출 (Int[])
    const members = await mongoPrisma.conversationMember.findMany({
      where: { conversationId },
      select: { userId: true },
    });

    if (members.length === 0) return [];

    const userIds = members.map((m) => m.userId);

    // 2. PostgreSQL MyProfile 테이블에서 해당 유저들의 프로필 정보 조회
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
  }


export const existsConversation = async (
  conversationId: string
) => {
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

//019fe984-f0ad-778b-af68-4f1a2660c757
  console.log("conversationId:", conversationId);
  console.log("cursor:", cursor);
  console.log("cursorDate:", cursorDate);
  console.log("now:", new Date());

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
    // ...(cursor && {
    //   cursor: { id: cursor },
    //   skip: 1,
    // }),
  });
  console.log("[chatRoom services] messages: ", messages)


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
      senderName: profile?.name ?? "",
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
  url: string
  guid: string
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

    // 3. 나를 제외한 멤버 unread 증가
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

  // 작성자 정보 조회 (PostgreSQL)
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
    senderName: profile?.name ?? "",
    flag: profile?.flag ?? "",
    content: message.content,
    attachments: message.attachments,
    createdAt: message.createdAt.toISOString(),
  };
};

export const createChatInfo = async (
  memberIds: number[],
  ownId: number,
  chatType: "DIRECT" | "GROUP",
  name: string //채팅방 이름
) => {

  let conversation;

  const newMemberIds = [...memberIds];
  newMemberIds.push(ownId);




  if ((newMemberIds.length !== 2) && chatType === "DIRECT") {
    throw new Error("잘못된 요청입니다!");
  }

  if (chatType === "DIRECT") {


    const receiverId = memberIds.find(
      (id) => id !== ownId
    );

    if (receiverId === undefined) {
      throw new Error("상대방이 없습니다.");
    }

    conversation = await getOrCreateDirect(ownId, receiverId, name);
    return conversation;
  } else { //그룹
    if (name == null) {
      throw new Error("제목을 입력하세요.");
    }
    conversation = await createGroup(newMemberIds, ownId, name);

    return conversation
  }
}



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
        create: memberIds.map(id => ({
          userId: id,
          role: ConversationMemberRole.MEMBER
        }))
      }
    }
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

  // 친구 확인
  // ...

  const directKey = [ownId, receiverId]
    .sort((a, b) => a - b)
    .join(":");

  // 1. 기존 DIRECT 채팅방 조회
  const existingConversation =
    await mongoPrisma.conversation.findFirst({
      where: {
        directKey
      }
    });

  if (existingConversation) {
    return existingConversation;
  }

  // 2. 없으면 생성
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
              userId: ownId
            },
            {
              userId: receiverId
            }
          ]
        }
      }
    });
  } catch (error: any) {

    // 동시에 같은 DIRECT 방을 생성하려고 한 경우
    // MongoDB partial unique index가 한쪽을 막음
    if (
      error?.code === 11000 ||
      error?.message?.includes("duplicate key")
    ) {

      const conversation =
        await mongoPrisma.conversation.findFirst({
          where: {
            directKey
          }
        });

      if (conversation) {
        return conversation;
      }
    }

    throw error;
  }
}


export const chatRoomService = {
  createChatInfo,
  createMessage,
  existsConversationMember,
  getMessages,
  existsConversation,
  getGroupChatMembers,
  getConversationInfo,
  leaveConversation

};