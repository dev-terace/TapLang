import api from "@/shared/auth/api.config";
import axios from "axios";

export namespace ChatRoomApi{


   interface CreateChatRequest {
      memberIds: number[];
      chatType: "DIRECT" | "GROUP";
      name?: String
      message: String
      attachments?: unknown | null;
   }


   interface CreateChatResponse{
      conversationId: String
   }


   interface createMessageRequest {
      conversationId: string;
      content: string;
      attachments?: unknown | null;
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

export async function existsConversation(conversationId: string){
   const response = await api.get(`/api/chat-room/${conversationId}`);

   console.log("getConvUnreadCount  response : ", response.data);

   return response.data;
}


export const getChatMessages = async (
  conversationId: string,
  createdAt?: string
) => {
  const response = await api.get(
    `/api/chat-room/message/${conversationId}/${createdAt}`,
  );


   console.log("getChatMessages: ", response.data)

  return response.data;
};

    
export async function createMessage(request: createMessageRequest)
{
   const response = await api.post("/api/chat-room/message",
      {
         conversationId: request.conversationId,
         content: request.content,
         attachments: request.attachments
         
      }
   )
   console.log("createMessage data: ", response.data)
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


}