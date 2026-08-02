import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatApi } from '../api/chat.api'


export interface ChatRoom {
  id: number
  name: string
  type: 'dm' | 'group'
  members: ChatMember[]
  lastMessage: string
  lastTime: string
  // unread: number
  // pinned: boolean
  // muted: boolean
}

export interface ChatMember {
  id: number
  name: string
  flag: string
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: unknown | null;
  createdAt?: Date;
}

export const useChatRoomStore = defineStore('chat', () => {
  const rooms = ref<ChatRoom[]>([])

  const createChat = ChatApi.createChat

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
    createChat
  }
})