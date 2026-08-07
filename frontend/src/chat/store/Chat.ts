import { defineStore } from 'pinia'
import { ChatApi } from '../api/chat.api'
import { ref } from 'vue'

export interface ConversationResponse {
    data: Conversation[]
    nextCursor: NextCursor | null
}

export interface Conversation {
    conversationId: string
    type: 'DIRECT' | 'GROUP'
    name: string | null
    members: ConversationMember[]
    unreadCount: number
    lastMessage: LastMessage | null
    lastMessageId: string | null
    lastMessageAt: string | null
}

export interface ConversationMember {
    userId: number
    role: 'OWNER' | 'MEMBER'
}

export interface LastMessage {
    id: string
    senderId: number
    content: string
    attachments: unknown | null
    createdAt: string
}

export interface NextCursor {
    conversationId: string
    lastMessageAt: string
}


export const useChatStore = defineStore('chat', () => {
    const conversations = ref<Conversation[]>([])


    const getMyConversations = async (): Promise<ConversationResponse> => {
        const result = await ChatApi.getMyConversations()

        conversations.value = result

        console.log("getMyConversations : ", conversations.value)
        return result;

    }

    const getConvUnreadCounts = ChatApi.getConversationUnreadCounts
    const readConversation = async (conversationId: string) => {
        // 읽음 처리
        await ChatApi.readConversation(conversationId);
        // 최신 대화 목록 다시 조회
        await getMyConversations()
    };

    return {
        conversations,
        getConvUnreadCounts,
        getMyConversations,
        readConversation
    }
})