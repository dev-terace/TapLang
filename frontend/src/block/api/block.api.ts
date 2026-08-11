import api from "@/shared/auth/api.config";
import axios from "axios"
// 1. 차단된 사용자 정보 타입
export interface BlockedUser {
    id: number;
    name: string;
    flag: string;
    statusMessage: string | null; // Prisma에서 statusMsg가 String?이므로 null 허용
}

// 2. 차단 요청 응답(Response) 타입
export interface getBlockUserResponse {
    message: string;
    blockedUsers: BlockedUser[];
}

export namespace BlockApi {
    export async function requestBlockUser(blockedId: number) {
        try {
            // 💡 POST 요청 시 백엔드로 blockedId 전달
            const response = await api.post("/api/block", { blockedId });

            console.log("response : ", response.data);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // 백엔드에서 내려준 에러 메시지가 있으면 출력, 없으면 기본 메시지
                alert(error.response?.data?.message ?? "사용자 차단 처리 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            // 호출한 곳(컴포넌트)에서도 에러 발생 여부를 알 수 있도록 rethrow
            throw error;
        }
    }


    export async function getBlockedUsers(): Promise<getBlockUserResponse> {
        try {
            // 💡 POST 요청 시 백엔드로 blockedId 전달
            const response = await api.get<getBlockUserResponse>("/api/block");

            console.log("response : ", response.data);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // 백엔드에서 내려준 에러 메시지가 있으면 출력, 없으면 기본 메시지
                alert(error.response?.data?.message ?? "사용자 차단 처리 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            // 호출한 곳(컴포넌트)에서도 에러 발생 여부를 알 수 있도록 rethrow
            throw error;
        }
    }


    export async function unBlockedUser(blockedId: number) {
        try {
            // 💡 POST 요청 시 백엔드로 blockedId 전달
            const response = await api.delete("/api/block", {
                params: { blockedId }
            });

            console.log("response : ", response.data);

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // 백엔드에서 내려준 에러 메시지가 있으면 출력, 없으면 기본 메시지
                alert(error.response?.data?.message ?? "사용자 차단 처리 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            // 호출한 곳(컴포넌트)에서도 에러 발생 여부를 알 수 있도록 rethrow
            throw error;
        }
    }

}
