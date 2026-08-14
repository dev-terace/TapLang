import api from "@/shared/auth/api.config";


export namespace ChatRoomNotificationApi {

  // ==========================================
  // 특정 채팅방 알림 설정 조회
  // ==========================================

  export async function getNotification(
    conversationId: string
  ) {

    const response = await api.get(
      `/api/chat-room-notification/${conversationId}`
    );

    console.log(
      "getNotification : response",
      response.data
    );

    return response.data;
  }


  // ==========================================
  // 특정 채팅방 알림 ON / OFF
  // ==========================================

  export async function updateNotification(
    conversationId: string,
    notificationEnabled: boolean
  ) {

    const response = await api.patch(
      `/api/chat-room-notification/${conversationId}`,
      {
        notificationEnabled
      }
    );

    console.log(
      "updateNotification : response",
      response.data
    );

    return response.data;
  }


  // ==========================================
  // 특정 채팅방 알림 토글
  // ==========================================

  export async function toggleNotification(
    conversationId: string
  ) {

    const response = await api.patch(
      `/api/chat-room-notification/${conversationId}/toggle`
    );

    console.log(
      "toggleNotification : response",
      response.data
    );

    return response.data;
  }

}