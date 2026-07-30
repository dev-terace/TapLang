import { defineStore } from 'pinia'
import { ref, computed } from 'vue'



export interface ChatRoom {
  id: number
  name: string
  type: 'dm' | 'group'
  members: ChatMember[]
  lastMessage: string
  lastTime: string
  unread: number
  pinned: boolean
  muted: boolean
}

export interface ChatMember {
  id: number
  name: string
  flag: string
  online: boolean
}

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
          flag: 'un',
          online: true,
        },
      ],
      lastMessage: '다들 점심은 드셨나요?',
      lastTime: '13:25',
      unread: 2,
      pinned: false,
      muted: false,
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