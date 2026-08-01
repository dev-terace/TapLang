import api from "@/shared/auth/api.config";
import axios from "axios";

export namespace ChatApi{


   interface CreateChatRequest {
      memberIds: number[];
      chatType: "DIRECT" | "GROUP";
      name?: String
      message: String
   }

   interface CreateChatResponse{
      conversationId: String
   }



    

export async function createChat(request: CreateChatRequest) {

    console.log("createChat request:", request);
  console.log("memberIds:", request.memberIds);
  console.log("chatType:", request.chatType);

  const response = await api.post<CreateChatResponse>("/api/chat", {
    memberIds: request.memberIds,
    chatType: request.chatType
  });

  console.log("response data", response.data)
  return response;
}

}