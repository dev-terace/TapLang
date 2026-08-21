import axios from "axios";
import api  from "@/shared/auth/api.config";

export namespace customChatApi {

  export interface CreateCustomChatRequest {
    name: string;
    description?: string;
    password?: string;
  }

  export interface CreateCustomChatResponse {
    conversationId: string;
  }


  
  export const createCustomChat = async (
    data: CreateCustomChatRequest
  ): Promise<CreateCustomChatResponse> => {

    try {

      const response =
        await api.post<CreateCustomChatResponse>(
          "/api/custom-chat",
          data
        );

      console.log(
        "createCustomChat res data:",
        response.data
      );

      return response.data;

    } catch (error) {

      if (axios.isAxiosError(error)) {

        throw new Error(
          error.response?.data?.message ??
          "커스텀 채팅방 생성에 실패했습니다."
        );
      }

      throw error;
    }
  };


  export interface CustomChatItem {
    id: string;
    type: "CUSTOM";
    name: string | null;
    description: string | null;

    memberCount: number;

    lastMessageId: string | null;
    lastMessageAt: string | null;

    createdAt: string;
    updatedAt: string;
  }


  export interface CustomChatCursor {
    lastMessageAt: string | null;
    memberCount: number;
    createdAt: string;
    id: string;
  }


  export interface GetCustomChatsResponse {
    items: CustomChatItem[];
    nextCursor: CustomChatCursor | null;
  }


export const getCustomChats = async (
  cursor?: CustomChatCursor
): Promise<GetCustomChatsResponse> => {

  try {

    const response =
      await api.get<GetCustomChatsResponse>(
        "/api/custom-chat",
        {
          params: cursor
            ? {
                cursor: JSON.stringify(cursor),
              }
            : undefined,
        }
      );

    console.log(
      "getCustomChats res data:",
      response.data
    );

    return response.data;

  } catch (error) {

    if (axios.isAxiosError(error)) {

      throw new Error(
        error.response?.data?.message ??
        "커스텀 채팅방 목록을 불러오지 못했습니다."
      );
    }

    throw error;
  }
};



  // =========================================================
  // CUSTOM 채팅방 입장
  // =========================================================

  export interface JoinCustomChatRequest {
    conversationId: string
  }


  export interface JoinCustomChatResponse {
    conversationId: string
  }

  export const joinConversation = async (
    conversationId: string
  ) => {

    try {

      console.log("custom joinConversation", conversationId)
      const response = await api.post(
        '/api/custom-chat-room/join',
        {
          conversationId,
        }
      )

      return response.data

    } catch (error) {

      console.error(
        'CustomChat 입장 실패:',
        error
      )

      throw error
    }
  }


  export const joinCustomChat = async (
    conversationId: string
  ): Promise<JoinCustomChatResponse> => {

    try {

      const response =
        await api.post<JoinCustomChatResponse>(
          "/api/custom-chat-room",
          {
            conversationId,
          }
        )

      console.log(
        "joinCustomChat res data:",
        response.data
      )

      return response.data

    } catch (error) {

      if (axios.isAxiosError(error)) {

        throw new Error(
          error.response?.data?.message ??
          "커스텀 채팅방 입장에 실패했습니다."
        )
      }

      throw error
    }
  }






}