import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatApi } from '../api/chat.api'


export interface ChatRoom {
  id: number
  name: string
  type: 'DIRECT' | 'GROUP'
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
  senderId: number;
  senderName?: string;
  content: string;
  createdAt: string;
}

export const useChatRoomStore = defineStore('chat', () => {
  // const rooms = ref<ChatRoom[]>([])
  const messages = ref<Message[]>([]);

  const addMessage = (message: Message) => {
    messages.value.push(message);
  };
  
  const createChat = ChatApi.createChat
  const createMessage = ChatApi.createMessage



  // const directRooms = computed(() =>
  //   rooms.value.filter(room => room.type === 'dm')
  // )

  // const groupRooms = computed(() =>
  //   rooms.value.filter(room => room.type === 'group')
  // )

  return {
    // rooms,
    // directRooms,
    // groupRooms,
    createChat,
    createMessage, 
    messages,
    addMessage
  }
})