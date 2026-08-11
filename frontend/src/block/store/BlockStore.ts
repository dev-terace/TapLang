import { defineStore } from 'pinia'
import { ref } from 'vue'
import { BlockApi, type BlockedUser } from '../api/block.api'



export const useBlockStore = defineStore('block', () => {
    const requestBlockUser = BlockApi.requestBlockUser
    const blockedUsers = ref<BlockedUser[]>([])
    const unBlockedUser = BlockApi.unBlockedUser;

    const getBlockedUsers = async () => {
    const response = await BlockApi.getBlockedUsers()
    
    // API 응답 구조의 배열을 ref에 저장
    blockedUsers.value = response.blockedUsers

    return response
  }



    
    return {
        blockedUsers,
        requestBlockUser,
        getBlockedUsers,
        unBlockedUser
    }
})