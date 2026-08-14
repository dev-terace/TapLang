import { postgresPrisma } from "../../lib/prisma";

const prisma = postgresPrisma


// ==================================================
// 특정 채팅방 알림 설정 조회
// ==================================================

export const getChatRoomNotification =
  async (
    profileId: number,
    conversationId: string
  ) => {

    const notification =
      await prisma.chatRoomNotification.findUnique({
        where: {
          profileId_conversationId: {
            profileId,
            conversationId
          }
        }
      })

    // 설정이 없으면 기본값 true
    return {
      conversationId,
      notificationEnabled:
        notification?.notificationEnabled ?? true
    }
  }


// ==================================================
// 특정 채팅방 알림 켜기/끄기
// ==================================================

export const setChatRoomNotification =
  async (
    profileId: number,
    conversationId: string,
    notificationEnabled: boolean
  ) => {

    return await prisma.chatRoomNotification.upsert({

      where: {
        profileId_conversationId: {
          profileId,
          conversationId
        }
      },

      update: {
        notificationEnabled
      },

      create: {
        profileId,
        conversationId,
        notificationEnabled
      }
    })
  }


// ==================================================
// 특정 채팅방 알림 토글
// ==================================================

export const toggleChatRoomNotification =
  async (
    profileId: number,
    conversationId: string
  ) => {

    const existing =
      await prisma.chatRoomNotification.findUnique({
        where: {
          profileId_conversationId: {
            profileId,
            conversationId
          }
        }
      })


    const notificationEnabled =
      existing
        ? !existing.notificationEnabled
        : false


    return await prisma.chatRoomNotification.upsert({

      where: {
        profileId_conversationId: {
          profileId,
          conversationId
        }
      },

      update: {
        notificationEnabled
      },

      create: {
        profileId,
        conversationId,
        notificationEnabled
      }
    })
  }

  export const chatRoomNotificationService = {
    getChatRoomNotification,
    toggleChatRoomNotification,
    setChatRoomNotification
  }