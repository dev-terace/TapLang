import { postgresPrisma  } from "../../lib/prisma";

const prisma = postgresPrisma


export interface ChatSettingsInput {
  chatSourceLanguage?: string
  chatTargetLanguage?: string
  messageTranslateLanguage?: string

  originalVoiceLanguage?: string
  translatedVoiceLanguage?: string

  notificationEnabled?: boolean
}


// =====================================================
// 채팅 설정 조회
// =====================================================

export const getChatSettings = async (
  profileId: number
) => {

  let settings = await prisma.chatSettings.findUnique({
    where: {
      profileId
    }
  })


  // 설정이 없으면 기본 설정 생성
  if (!settings) {

    settings = await prisma.chatSettings.create({
      data: {
        profileId
      }
    })

  }


  return settings
}


// =====================================================
// 채팅 설정 저장 / 수정
// =====================================================

export const updateChatSettings = async (
  profileId: number,
  data: ChatSettingsInput
) => {

  const settings =
    await prisma.chatSettings.upsert({

      where: {
        profileId
      },

      create: {
        profileId,

        chatSourceLanguage:
          data.chatSourceLanguage ?? 'ko',

        chatTargetLanguage:
          data.chatTargetLanguage ?? 'en',

        messageTranslateLanguage:
          data.messageTranslateLanguage ?? 'ko',

        originalVoiceLanguage:
          data.originalVoiceLanguage ?? 'auto',

        translatedVoiceLanguage:
          data.translatedVoiceLanguage ?? 'ko',

        notificationEnabled:
          data.notificationEnabled ?? true
      },

      update: {
        ...(data.chatSourceLanguage !== undefined && {
          chatSourceLanguage:
            data.chatSourceLanguage
        }),

        ...(data.chatTargetLanguage !== undefined && {
          chatTargetLanguage:
            data.chatTargetLanguage
        }),

        ...(data.messageTranslateLanguage !== undefined && {
          messageTranslateLanguage:
            data.messageTranslateLanguage
        }),

        ...(data.originalVoiceLanguage !== undefined && {
          originalVoiceLanguage:
            data.originalVoiceLanguage
        }),

        ...(data.translatedVoiceLanguage !== undefined && {
          translatedVoiceLanguage:
            data.translatedVoiceLanguage
        }),

        ...(data.notificationEnabled !== undefined && {
          notificationEnabled:
            data.notificationEnabled
        })
      }
    })


  return settings
}

export const chatSettingsService = {
    updateChatSettings,
    getChatSettings
}