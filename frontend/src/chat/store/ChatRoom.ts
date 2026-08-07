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
  flag: string;
}

interface ConversationCache {
  conversationId: string;
  lastMessageDate: string;
}

export const useChatRoomStore = defineStore('chatRoom', () => {
  // const rooms = ref<ChatRoom[]>([])
  const conversationId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  const messageCache = ref<Map<string, string>>(new Map());



  const hasMessageCache = (conversationId: string): boolean => {
    return messageCache.value.has(conversationId);
  };
  const addMessage = (message: Message) => {
    messages.value.push(message);
    addMessageCache(message)
  };

  const addMessageCache = (message: Message) => {

    const oldDate = messageCache.value.get(
      message.conversationId
    );

    if (
      !oldDate ||
      new Date(message.createdAt).getTime() >
      new Date(oldDate).getTime()
    ) {

      messageCache.value.set(
        message.conversationId,
        message.createdAt
      );

    }

    if (messageCache.value.size <= 1) { return; }

    const currentConversationId = conversationId.value;

    const candidates = [...messageCache.value.entries()]
      .filter(
        ([id]) => id !== currentConversationId
      );

    if (candidates.length === 0) { return; }

    const oldestConversationId = candidates
      .sort(
        (a, b) =>
          new Date(a[1]).getTime()
          -
          new Date(b[1]).getTime()
      )[0][0];


    messageCache.value.delete(oldestConversationId);
      
    messages.value = messages.value.filter(
      msg =>
        msg.conversationId !== oldestConversationId
    );
  }


  const createChat = ChatRoomApi.createChat
  const createMessage = ChatRoomApi.createMessage
  const getChatMessages = ChatRoomApi.getChatMessages



  return {
    createChat,
    createMessage,
    messages,
    messageCache,
    hasMessageCache,
    addMessageCache,
    addMessage,
    getChatMessages,
    conversationId
  }
})