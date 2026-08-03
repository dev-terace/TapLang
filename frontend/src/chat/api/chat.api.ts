import api from "@/shared/auth/api.config";
import axios from "axios";

export namespace ChatApi{


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

    
export async function createMessage(request: createMessageRequest)
{
   const response = await api.post("/api/chat/message",
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

  const response = await api.post<CreateChatResponse>("/api/chat", {
    memberIds: request.memberIds,
    chatType: request.chatType,
    name: request.name,
    message: request.message,
    attachments: request.attachments
  });

  console.log("response data", response.data)
  return response.data.conversationId;
}

}