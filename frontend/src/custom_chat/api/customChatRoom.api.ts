import axios from "axios";
import api  from "@/shared/auth/api.config";



export namespace customChatRoomApi {
  export interface TransferOwnerRequest {
  conversationId: string;
  targetUserId: number;
}

export interface TransferOwnerResponse {
  success: boolean;
  message?: string;
}

export const transferOwner = async ({
  conversationId,
  targetUserId,
}: TransferOwnerRequest): Promise<TransferOwnerResponse> => {
  try {
    const response = await api.patch<TransferOwnerResponse>(
      `/api/custom-chat-room/${conversationId}/owner`,
      {
        targetUserId,
      }
    );

    console.log("transferOwner res data:", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "방장 권한 위임에 실패했습니다."
      );
    }

    throw error;
  }
};


// =========================================================
// 멤버 강퇴
// =========================================================

export interface KickMemberRequest {
  conversationId: string;
  targetUserId: number;
}

export interface KickMemberResponse {
  success: boolean;
  message?: string;
}

export const kickMember = async ({
  conversationId,
  targetUserId,
}: KickMemberRequest): Promise<KickMemberResponse> => {
  try {
    const response = await api.delete<KickMemberResponse>(
      `/api/custom-chat-room/${conversationId}/members/${targetUserId}`
    );

    console.log("kickMember res data:", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ??
          "멤버 강퇴에 실패했습니다."
      );
    }

    throw error;
  }
};
}