import api from "@/shared/auth/api.config";
import axios from "axios";
import i18n from "@/i18n"; // 프로젝트 i18n 인스턴스 경로

export interface BlockedUser {
  id: number;
  name: string;
  flag: string;
  statusMessage: string | null;
}

export interface getBlockUserResponse {
  blockedUsers: BlockedUser[];
}

// 공통 에러 알림 핸들러
const handleBlockApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const errorCode = error.response?.data?.code;
    const i18nKey = `block-api.${errorCode}`;

    // 백엔드 에러 코드가 i18n 키에 존재하는지 확인 후 출력
    if (errorCode && i18n.global.te(i18nKey)) {
      alert(i18n.global.t(i18nKey));
    } else {
      alert(i18n.global.t("block-api.defaultError"));
    }
  } else {
    alert(i18n.global.t("block-api.unknownError"));
  }
};

export namespace BlockApi {
  export async function requestBlockUser(blockedId: number) {
    try {
      const response = await api.post("/api/block", { blockedId });
      return response.data;
    } catch (error) {
      handleBlockApiError(error);
      throw error;
    }
  }

  export async function getBlockedUsers(): Promise<getBlockUserResponse> {
    try {
      const response = await api.get<getBlockUserResponse>("/api/block");
      return response.data;
    } catch (error) {
      handleBlockApiError(error);
      throw error;
    }
  }

  export async function unBlockedUser(blockedId: number) {
    try {
      const response = await api.delete("/api/block", {
        params: { blockedId }
      });
      return response.data;
    } catch (error) {
      handleBlockApiError(error);
      throw error;
    }
  }
}