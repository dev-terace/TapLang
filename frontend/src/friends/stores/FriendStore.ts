import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {useAuthStore} from '@/shared/auth/AuthStore'
import axios from "axios";
import api from '@/shared/auth/api.config'
import { FriendApi } from '../api/friends.api';

interface Friend {
  id: number
  name: string
  flag: string
  statusMsg?: string
  online: boolean
}
interface ReqFriends {
  id: number;
  name: string;
  flag: string;
  status: "SENT" | "RECEIVED";
}

export const useFriendStore = defineStore('friend', () => {


  const authStore = useAuthStore()
  // 친구 목록
  const friends = ref<Friend[]>([])
  const reqFriends = ref<ReqFriends[]>([])

const fetchFriends = async () => {
  const response = await FriendApi.getFriends();
  console.log("fetchFriends : ", response);

  // 1. 기존 친구 목록의 온라인 상태를 기억해둡니다 (id를 기준으로)
  const currentOnlineStatus = new Map(
    friends.value.map(f => [f.id, f.online])
  );

  friends.value = response.data.friends.map(friend => ({
    ...friend,
    // 2. 백엔드에서 online 값을 준다면 그것을 쓰고, 
    // 없다면 기존 상태를 유지, 그것도 없다면(새 친구) false로 설정
    online: friend.online ?? currentOnlineStatus.get(friend.id) ?? false
  }))
  
  }

  watch(
    () => authStore.userInfo,
    (user) => {
      if (!user?.id) {
        return;
      }

        fetchFriends();
        findReqFriends();
      
    },
    { immediate: true }
  )





  const onlineFriends = computed(() =>
    friends.value.filter(friend => friend.online)
  )


  const offlineFriends = computed(() =>
    friends.value.filter(friend => !friend.online)
  )






const findReqFriends = async () => {
    const response  = await FriendApi.findReqFriends();
  
    if(response != null)
    {
      console.log("response.data.friends:  ", response)
      reqFriends.value = response;
    }  
}
  const addFriendRequest = FriendApi.addFriendRequest

  const acceptFriendRequest = FriendApi.acceptFriendRequest

  const declinedFriendRequest = FriendApi.declinedFriendRequest

  const deleteFriend = FriendApi.deleteFriend
  


  const myStatusMessage = ref('');

  // 상태 메시지 업데이트 Action
  const updateStatusMessage = async (payload: { message: string }) => {
    try {
      const result = await FriendApi.updateStatusMessage(payload.message);
      
      if (result.success) {
        // 성공 시 로컬 Store 상태도 동기화
        myStatusMessage.value = payload.message;
        return result;
      }
    } catch (error) {
      console.error('Store: 상태 메시지 업데이트 실패', error);
      throw error; // UI 컴포넌트(Modal)로 에러를 던져서 알림창 등을 띄울 수 있게 함
    }
  };

  return {
    friends,
    onlineFriends,
    offlineFriends,
    reqFriends,
    addFriendRequest,
    acceptFriendRequest,
    fetchFriends,
    findReqFriends,
    declinedFriendRequest,
    deleteFriend,
    updateStatusMessage,
    myStatusMessage
  }
})