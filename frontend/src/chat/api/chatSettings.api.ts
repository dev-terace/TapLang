import api from "@/shared/auth/api.config";


export namespace ChatSettingsApi {

  // =====================================================
  // 채팅 설정 조회
  // =====================================================

  export async function getChatSettings() {

    const response = await api.get("/api/chat-settings");

    console.log(
      "getChatSettings : response",
      response.data
    );

    return response.data;
  }


  // =====================================================
  // 채팅 설정 수정
  // =====================================================

  export async function updateChatSettings(data: {

    chatSourceLanguage?: string;
    chatTargetLanguage?: string;

    messageTranslateLanguage?: string;

    originalVoiceLanguage?: string;
    translatedVoiceLanguage?: string;

    notificationEnabled?: boolean;

  }) {

    const response = await api.patch(
      "/api/chat-settings",
      data
    );

    console.log(
      "updateChatSettings : response",
      response.data
    );

    return response.data;
  }

}