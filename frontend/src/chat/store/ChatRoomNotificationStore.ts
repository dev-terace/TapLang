import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ChatRoomNotificationApi } from '../api/chatRoomNotification.api'

export const useChatRoomNotificationStore = defineStore(
  'chatRoomNotification',
  () => {

    // ==================================================
    // 채팅방별 알림 상태
    //
    // {
    //   "conversation-id-1": true,
    //   "conversation-id-2": false
    // }
    // ==================================================

    const notificationSettings =
      ref<Record<string, boolean>>({})


    // ==================================================
    // 로딩 상태
    // ==================================================

    const isLoading = ref(false)


    // ==================================================
    // 특정 채팅방 알림 설정 조회
    // ==================================================

    const getNotification = async (
      conversationId: string
    ) => {

      try {

        isLoading.value = true

        const data =
          await ChatRoomNotificationApi.getNotification(
            conversationId
          )


        const enabled =
          data?.notificationEnabled ?? true


        // 채팅방별 상태 저장
        notificationSettings.value[conversationId] =
          enabled


        return enabled

      } catch (error) {

        console.error(
          '채팅방 알림 설정 조회 실패:',
          error
        )


        // 조회 실패 시 기본값
        notificationSettings.value[conversationId] =
          true


        return true

      } finally {

        isLoading.value = false

      }

    }


    // ==================================================
    // 특정 채팅방 알림 상태 가져오기
    // ==================================================

    const isNotificationEnabled = (
      conversationId: string
    ) => {

      return (
        notificationSettings.value[
          conversationId
        ] ?? true
      )

    }


    // ==================================================
    // 특정 채팅방 알림 ON / OFF
    // ==================================================

    const updateNotification = async (
      conversationId: string,
      enabled: boolean
    ) => {

      try {

        isLoading.value = true


        const response =
          await ChatRoomNotificationApi.updateNotification(
            conversationId,
            enabled
          )


        const newEnabled =
          response?.data?.notificationEnabled
          ?? response?.notificationEnabled
          ?? enabled


        // Store 즉시 반영
        notificationSettings.value[conversationId] =
          newEnabled


        return response

      } catch (error) {

        console.error(
          '채팅방 알림 설정 변경 실패:',
          error
        )

        return null

      } finally {

        isLoading.value = false

      }

    }


    // ==================================================
    // 알림 토글
    // ==================================================

    const toggleNotification = async (
      conversationId: string
    ) => {

      try {

        isLoading.value = true


        const response =
          await ChatRoomNotificationApi.toggleNotification(
            conversationId
          )


        const newEnabled =
          response?.data?.notificationEnabled
          ?? response?.notificationEnabled


        if (newEnabled !== undefined) {

          notificationSettings.value[conversationId] =
            newEnabled

        }


        return response

      } catch (error) {

        console.error(
          '채팅방 알림 토글 실패:',
          error
        )

        return null

      } finally {

        isLoading.value = false

      }

    }


    // ==================================================
    // 특정 채팅방 상태 직접 변경
    // ==================================================
    //
    // UI에서 토글만 먼저 변경하고
    // 확인 버튼에서 서버에 저장하고 싶을 때 사용
    //

    const setNotificationEnabled = (
      conversationId: string,
      enabled: boolean
    ) => {

      notificationSettings.value[conversationId] =
        enabled

    }


    // ==================================================
    // 특정 채팅방 상태 제거
    // ==================================================

    const removeNotificationSetting = (
      conversationId: string
    ) => {

      delete notificationSettings.value[
        conversationId
      ]

    }


    // ==================================================
    // 전체 상태 초기화
    // ==================================================

    const reset = () => {

      notificationSettings.value = {}

      isLoading.value = false

    }


    return {

      notificationSettings,

      isLoading,

      getNotification,

      isNotificationEnabled,

      updateNotification,

      toggleNotification,

      setNotificationEnabled,

      removeNotificationSetting,

      reset

    }

  }
)