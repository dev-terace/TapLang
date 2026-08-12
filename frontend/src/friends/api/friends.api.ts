import api from "@/shared/auth/api.config";
import axios from "axios";

export namespace FriendApi {


    interface GetFriendsResponse {
        friends: GetFriends[];
    }

    interface GetFriends {
        id: number;
        name: string;
        flag: string;
        statusMsg?: string;
    }


    interface AddFriendRequest {
        searchName: string;
    }


    interface AddFriendResponse {
        id: number;
        name: string;
        flag: string;
        statusMsg?: string;
    }

    interface FindReqFriends{
        id: number;
        name: string;
        flag: string;
        
    }

    interface FindReqFriendsResponse{
        friends: FindReqFriends[];
    }

    export async function getFriends() {
        const response = await api.get<GetFriendsResponse>("/api/friends");
        return response;
    }


    export async function addFriendRequest(searchName: AddFriendRequest) {
        try {
            const response = await api.post<AddFriendResponse>(
                "/api/friends/request",
                searchName
            );

            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message ?? "친구 요청 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            throw error;
        }
    }


    export async function findReqFriends() {
        try {
            const response  = await api.get<FindReqFriendsResponse>("/api/friends/request");
            
            console.log("find req friends func : ", response);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message ?? "친구 요청 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            throw error;
        }
    }

    export const acceptFriendRequest = async (friendId: number) => {
        return await api.post(`/api/friends/request/${friendId}`);
    };

    export const declinedFriendRequest = async (friendId: number, self: boolean) => {
        console.log("declined friend req : ", friendId)
        return await api.delete(`/api/friends/request/${friendId}/${self}`);
    };


    export async function deleteFriend(friendId: number) {
        try {
            const response = await api.delete(
                `/api/friends/${friendId}`
            );

            return response;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                alert(error.response?.data?.message ?? "친구 삭제 요청 중 오류가 발생했습니다.");
            } else {
                alert("알 수 없는 오류가 발생했습니다.");
            }

            throw error;
        }
    }

    

}