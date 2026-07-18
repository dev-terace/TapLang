import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatRoom } from '@/types'

export const useChatStore = defineStore('chat', () => {
  const rooms = ref<ChatRoom[]>([
    {
      id: 1,
      name: '아날로그',
      type: 'dm',
      members: [
        {
          id: 1,
          name: '아날로그',
          avatar: '😀',
          online: true,
        },
      ],
      lastMessage: '다들 점심은 드셨나요?',
      lastTime: '13:25',
      unread: 2,
      pinned: false,
      muted: false,
    },

    {
      id: 2,
      name: '개발자 모임',
      type: 'group',
      members: [
        {
          id: 1,
          name: '아날로그',
          avatar: '😀',
          online: true,
        },
        {
          id: 2,
          name: 'Retro',
          avatar: '😎',
          online: true,
        },
        {
          id: 3,
          name: 'Coder',
          avatar: '🤖',
          online: false,
        },
      ],
      lastMessage: '오늘 배포 완료!',
      lastTime: '12:41',
      unread: 12,
      pinned: true,
      muted: false,
    },

    {
      id: 3,
      name: '게임 파티',
      type: 'group',
      members: [
        {
          id: 1,
          name: '아날로그',
          avatar: '😀',
          online: true,
        },
        {
          id: 2,
          name: '냥이',
          avatar: '🐱',
          online: false,
        },
        {
          id: 3,
          name: 'Pixel',
          avatar: '👾',
          online: true,
        },
        {
          id: 4,
          name: 'Player',
          avatar: '🎮',
          online: true,
        },
      ],
      lastMessage: '8시에 접속!',
      lastTime: '어제',
      unread: 0,
      pinned: false,
      muted: true,
    },
  ])

  const unreadRooms = computed(() =>
    rooms.value.filter(room => room.unread > 0)
  )

  const pinnedRooms = computed(() =>
    rooms.value.filter(room => room.pinned)
  )

  const dmRooms = computed(() =>
    rooms.value.filter(room => room.type === 'dm')
  )

  const groupRooms = computed(() =>
    rooms.value.filter(room => room.type === 'group')
  )

  return {
    rooms,
    unreadRooms,
    pinnedRooms,
    dmRooms,
    groupRooms,
  }
})