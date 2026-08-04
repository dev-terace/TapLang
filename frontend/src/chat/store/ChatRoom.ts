import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatRoomApi } from '../api/chatRoom.api'



export interface Message {
  id: string;
  senderId: number;
  senderName?: string;
  content: string;
  createdAt: string;
}

export const useChatRoomStore = defineStore('chatRoom', () => {
  // const rooms = ref<ChatRoom[]>([])
  const messages = ref<Message[]>([]);

  const addMessage = (message: Message) => {
    messages.value.push(message);
  };
  
  const createChat = ChatRoomApi.createChat
  const createMessage = ChatRoomApi.createMessage



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