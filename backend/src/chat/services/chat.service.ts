import { PrismaClient} from "../../../generated/mongo";
import { v7 as uuidv7 } from "uuid";
import { ConversationMemberRole } from "../../../generated/mongo";

const prisma = new PrismaClient();


prisma.$connect().then(async () => {
  console.log(
    "Mongo connected"
  );

  const result = await prisma.$runCommandRaw({
    hello: 1
  });

  console.log(result);
});

//memberIds 값의 ownId가 포함 됨

export const createMessage = async (
  conversationId: string,
  senderId: number,
  content: string,
  attachments?: unknown | null
) => {
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
      attachments: attachments ?? null,
    },
  });

  return message;
};

export const createChatInfo = async (
    memberIds: number[], 
    ownId: number, 
    chatType: "DIRECT" | "GROUP",
    name?: string //채팅방 이름
) => {

    let conversation;
    memberIds.push(ownId);
    
    console.log("prisma : ", Object.keys(prisma));


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

        conversation = await getOrCreateDirect(ownId, receiverId);
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
  return prisma.conversation.create({
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
  receiverId: number
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


  return prisma.conversation.upsert({
    where: {
      directKey
    },

    update: {
    },

    create: {
      id: uuidv7(),
      type: "DIRECT",
      directKey,

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


export const chatService = {
  createChatInfo,
  createMessage
  
};