import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Friend, MyProfile } from '../types'
import {useAuthStore} from '@/stores/AuthStore'
import { useSocketStore } from "./SocketStore";
import { useAuth } from '@clerk/vue'

import axios, { AxiosError } from "axios";
import api from '@/services/api.service'
import { setTokenGetter } from "@/services/auth.service";
export const useFriendStore = defineStore('friend', () => {

  const { getToken } = useAuth();
  setTokenGetter(getToken);

  const authStore = useAuthStore()
  // 친구 목록
  const friends = ref<Friend[]>([
  ])



  const fetchFriends = async (ownId: number) => {
  const { data } = await axios.get(`/api/friends/${ownId}`)
    friends.value = data.friends
    console.log("friends: " + friends)
  }

  watch(
    () => authStore.userInfo,
    (user) => {
      if (user) {
        fetchFriends(user.id)
      }
    },
    { immediate: true }
  )





  const onlineFriends = computed(() =>
    friends.value.filter(friend => friend.online)
  )


  const offlineFriends = computed(() =>
    friends.value.filter(friend => !friend.online)
  )





interface AddFriendRequest {
  searchName: string;
  ownId: Number;
}


const reqFriend = async ({ searchName, ownId }: AddFriendRequest) => {
  try {
    const { data } = await api.post("/api/friends/request", {
      searchName,
      ownId,
    },
    
  );

    console.log("name :" +name +", ownId : " +ownId)

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message ?? "친구 요청 중 오류가 발생했습니다.");
    } else {
      alert("알 수 없는 오류가 발생했습니다.");
    }

    throw error;
  }
};
  


  return {
    friends,
    onlineFriends,
    offlineFriends,
    reqFriend
  }
})