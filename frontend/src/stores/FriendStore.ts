import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Friend, MyProfile } from '../types'


export const useFriendStore = defineStore('friend', () => {

  // 내 프로필
  const myProfile = ref<MyProfile>({
    id: 0,
    name: '나',
    avatar: '🙂',
    statusMsg: '오늘도 코딩중'
  })


  // 친구 목록
  const friends = ref<Friend[]>([
    {
      id: 1,
      name: '사이버_러버',
      avatar: '🪐',
      statusMsg: '로그 분석 시스템 기동 중',
      online: true
    },
    {
      id: 2,
      name: '아날로그_웨이브',
      avatar: '💾',
      statusMsg: '버디버디 전보 대기',
      online: true
    }
  ])


  const onlineFriends = computed(() =>
    friends.value.filter(friend => friend.online)
  )


  const offlineFriends = computed(() =>
    friends.value.filter(friend => !friend.online)
  )


  // 내 프로필 변경
  const updateProfile = (data: Partial<MyProfile>) => {
    myProfile.value = {
      ...myProfile.value,
      ...data
    }
  }


  const addFriend = (data: { name: string; statusMsg: string }) => {
    friends.value.push({
      id: Date.now(),
      name: data.name,
      avatar: '👾',
      statusMsg: data.statusMsg || '시스템 대기 중',
      online: true
    })
  }


  return {
    myProfile,
    friends,
    onlineFriends,
    offlineFriends,
    updateProfile,
    addFriend
  }
})