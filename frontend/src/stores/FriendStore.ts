import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Friend } from '../types'

export const useFriendStore = defineStore('friend', () => {

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


  const addFriend = (data: { name: string; statusMsg: string }) => {
    friends.value.push({
      id: Date.now(), // 중복 없는 고유 ID 생성 (매우 중요!)
      name: data.name,
      avatar: '👾', // 기본 아바타 이모지 설정
      statusMsg: data.statusMsg || '시스템 대기 중',
      online: true // 새로 등록한 친구는 기본적으로 온라인으로 추가
    })
  }
  

  return {
    friends,
    onlineFriends,
    offlineFriends,
    addFriend
  }
})


