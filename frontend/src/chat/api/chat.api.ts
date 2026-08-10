import api from "@/shared/auth/api.config";


export namespace ChatApi{
export async function getConversationUnreadCounts()
{
   const response = await api.get("/api/chat/unread-count");

   console.log("getConvUnreadCount  response : ", response.data);

   return response.data;
}




export async function getMyConversations(){
   const response = await api.get("/api/chat");

   console.log("getConvUnreadCount  response : ", response.data);

   return response.data;
}

export async function readConversation(conversationId: string)
{
   const response = await api.patch(`/api/chat/unread-count/${conversationId}`)

   console.log("readConversation : response", response)
}

}
