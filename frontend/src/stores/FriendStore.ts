import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Friend, MyProfile, ReqFriends } from '../types'
import {useAuthStore} from '@/stores/AuthStore'
import axios from "axios";
import api from '@/services/api.service'

export const useFriendStore = defineStore('friend', () => {


  const authStore = useAuthStore()
  // 친구 목록
  const friends = ref<Friend[]>([])
  const reqFriends = ref<ReqFriends>([])

  const fetchFriends = async (ownId: number) => {
  const { data } = await api.get(`/api/friends/${ownId}`)
    friends.value = data.friends
    console.log("friends: " + friends)
  }

  watch(
    () => authStore.userInfo,
    (user) => {
      if (user) {
        fetchFriends(user.id);
        findReqFriends();
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
}

const findReqFriends = async () => {
   try {
    const { data } = await api.get("/api/friends/request");
    console.log("FriendStore: findReqFriends: data:", JSON.stringify(data, null, 2));


    reqFriends.value = data.friends.map((friend) => ({
      name: friend.profile.name,
      flag: friend.profile.flag,
      }));

  } catch (error) {
    if (axios.isAxiosError(error)) {
      alert(error.response?.data?.message ?? "친구 요청 중 오류가 발생했습니다.");
    } else {
      alert("알 수 없는 오류가 발생했습니다.");
    }
 
    throw error;
  }
}

const reqFriend = async ({ searchName }: AddFriendRequest) => {
  try {
    const { data } = await api.post("/api/friends/request", {
      searchName
    },
    
  );



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
    reqFriends,
    reqFriend
  
  }
})