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
  friends.value = response.data.friends.map(friend => ({
  ...friend,
  online: false
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
      console.log("response.data.friends:  ", response.data.friends)
      reqFriends.value = response.data.friends;
    }  
}
  const addFriendRequest = FriendApi.addFriendRequest

  const acceptFriendRequest = FriendApi.acceptFriendRequest

  const declinedFriendRequest = FriendApi.declinedFriendRequest

  


  return {
    friends,
    onlineFriends,
    offlineFriends,
    reqFriends,
    addFriendRequest,
    acceptFriendRequest,
    fetchFriends,
    findReqFriends,
    declinedFriendRequest
  
  }
})