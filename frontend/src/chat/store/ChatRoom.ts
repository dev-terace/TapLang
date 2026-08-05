import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatRoomApi } from '../api/chatRoom.api'



export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  senderName?: string;
  content: string;
  attachments?: unknown | null;
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
  const getChatMessages = ChatRoomApi.getChatMessages



  return {
    createChat,
    createMessage, 
    messages,
    addMessage,
    getChatMessages
  }
})