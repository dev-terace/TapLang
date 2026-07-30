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
  statusMsg: string
  online: boolean
}
interface ReqFriends{
  id: number,
  name: String   
  flag: String  
}

export const useFriendStore = defineStore('friend', () => {


  const authStore = useAuthStore()
  // 친구 목록
  const friends = ref<Friend[]>([])
  const reqFriends = ref<ReqFriends[]>([])

  const fetchFriends = async (ownId: number) => {
  const response = await FriendApi.getFriends();

  console.log("fetchFriends : ", response);
  friends.value = response.data.friends
  
  }

  watch(
    () => authStore.userInfo,
    (user) => {
      if (!user?.id) {
        return;
      }

        fetchFriends(user.id);
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
      console.log("response.data.friends:  ", response.data.friends)
      reqFriends.value = response.data.friends;
    }  
}
  const addFriendRequest = FriendApi.addFriendRequest
// const reqFriend = async ({ searchName }: AddFriendRequest) => {
//   try {
//     const { data } = await api.post("/api/friends/request", {
//       searchName
//     },
    
//   );



//     return data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       alert(error.response?.data?.message ?? "친구 요청 중 오류가 발생했습니다.");
//     } else {
//       alert("알 수 없는 오류가 발생했습니다.");
//     }
 
//     throw error;
//   }
// };
  


  return {
    friends,
    onlineFriends,
    offlineFriends,
    reqFriends,
    addFriendRequest
  
  }
})