import api from "@/shared/auth/api.config";
import axios from "axios";
import { useSocketRegister } from '@/shared/socket/socket.register.js'
import { useUIStore } from "@/shared/ui/UiStore";
import { useChatStore } from "../store/Chat";
export namespace ChatRoomApi{


   

   interface CreateChatRequest {
      memberIds: number[];
      chatType: "DIRECT" | "GROUP";
      name?: string | null
      message: string
      attachments?: unknown | null;
   }


   interface CreateChatResponse{
      conversationId: string
   }

   export interface Attachment {
    url: string
    guid: string
}

   interface createMessageRequest {
      conversationId: string;
      content: string;
      attachments?: Attachment[];
}

  interface getGroupChatMembersResponse{
        id: number,
        name: string,
        flag: string,
        statusMsg?: string,
  }



 export  async function leaveConversation(conversationId: string) {
  const socketStore = useSocketRegister()

  const response = await api.delete(
    `/api/chat-room/${conversationId}`,
  )

 if(!socketStore.socket)
 {
  return 
 }
  
 if (response.data.data.deleted) {
    socketStore.socket.emit("chat-room:leave", conversationId)
 }

  return response.data
}
export async function getGroupChatMembers(conversationId: string) {
  try {
    const response = await api.get<getGroupChatMembersResponse[]>(`/api/chat-room/group/${conversationId}`);

    console.log("getGroupChatMembers response : ", response.data);

    return response.data;
  } catch (error) {
    console.error(`[getGroupChatMembers Error] conversationId: ${conversationId}`, error);
    throw error;
  }
}



export async function joinConversation(
  conversationId: string,
  memberIds: number[]
) {
  try {
    const response = await api.post(
      "/api/chat-room/join",
      {
         memberIds
        ,
        conversationId
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "[joinConversation] error:",
      error.response?.data ?? error
    );

    throw error;
  }
}

  export async function existsConversation(
    conversationId: string
  ) {

    try {

      const response = await api.get(
        `/api/chat-room/${conversationId}`
      );

      console.log(
        "getConversation response:",
        response.data
      );

      return response.data;

    } catch (error) {

      console.error(
        `[getConversation Error] conversationId: ${conversationId}`,
        error
      );

      throw error;
    }
  }


export const getChatMessages = async (
  conversationId: string,
  createdAt?: string
) => {
  const response = await api.get(
    `/api/chat-room/message/${conversationId}`,
    { params: createdAt ? { createdAt } : {} }
  );

  console.log("getChatMessages: ", response.data)

  return response.data;
};

    
export async function createMessage(
  request: createMessageRequest
) {
  const uiStore = useUIStore();
  const chatStore = useChatStore()

  try {
    console.log('[createMessage request]', request)

    const response = await api.post(
      "/api/chat-room/message",
      {
        conversationId: request.conversationId,
        content: request.content,
        attachments: request.attachments
      }
    )

    console.log(
      '[createMessage response]',
      response.data
    )

    return response.data

  } catch (error: any) {

    console.error(
      '[createMessage error]',
      error
    )

    console.error(
      '[createMessage status]',
      error.response?.status
    )

    console.error(
      '[createMessage server response]',
      error.response?.data
    )

    console.error(
      '[createMessage request]',
      error.config?.data
    )

    // 서버에서 400을 반환한 경우
    if (error.response?.status === 400) {
      chatStore.getMyConversations()
      uiStore.changeTab('chat')  

      
      const message =
        error.response?.data?.message ??
        '메시지를 보낼 수 없습니다.'

     
      alert(message)
      
    }

    throw error
  }
}

export async function createChat(request: CreateChatRequest) {

  console.log("createChat request:", request);
  console.log("memberIds:", request.memberIds);
  console.log("chatType:", request.chatType);

  const response = await api.post<CreateChatResponse>("/api/chat-room", {
    memberIds: request.memberIds,
    chatType: request.chatType,
    name: request.name,
    message: request.message,
    attachments: request.attachments
  });

  console.log("createChat response data", response.data)
  return response.data.conversationId;
}


  export async function getConversationInfo(
    conversationId: string
  ) {

    try {

      const response =
        await api.get(
          `/api/chat-room/info/${conversationId}`
        );

      console.log(
        "getConversationInfo response:",
        response.data
      );

      return response.data;

    } catch (error) {

      console.error(
        `[getConversationInfo Error] conversationId: ${conversationId}`,
        error
      );

      throw error;
    }
  }


}