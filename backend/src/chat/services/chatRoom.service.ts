import { mongoPrisma, postgresPrisma} from "../../lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { ConversationMemberRole } from "../../../generated/mongo";





//memberIds 값의 ownId가 포함 됨


export const getMessages = async (
  conversationId: string,
  cursor?: string
) => {
  const messages = await mongoPrisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
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


export const createMessage = async (
  conversationId: string,
  senderId: number,
  content: string,
  attachments?: unknown | null
) => {
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
    memberIds.push(ownId);
    
  


    if((memberIds.length !== 2) && chatType === "DIRECT")
    {
         throw new Error("잘못된 요청입니다!");
    }

    if (chatType === "DIRECT") {
        

        const receiverId = memberIds.find(
             (id) => id !== ownId
        );

        if (receiverId === undefined) {
        throw new Error("상대방이 없습니다.");}

        conversation = await getOrCreateDirect(ownId, receiverId, name);
        return conversation;
    } else { //그룹
        if(name == null)
        {
            throw new Error("제목을 입력하세요.");
        }
        conversation =  await createGroup(memberIds, ownId, name);

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
          role: id === ownId
          ? ConversationMemberRole.OWNER : 
            ConversationMemberRole.MEMBER
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

  const directKey = [
    ownId,
    receiverId
  ]
    .sort()
    .join(":");


  return mongoPrisma.conversation.upsert({
    where: {
      directKey
    },

    update: {
    },

    create: {
      id: uuidv7(),
      type: "DIRECT",
      directKey,
      name: name,

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
}


export const chatRoomService = {
  createChatInfo,
  createMessage,
  existsConversationMember,
  getMessages

};