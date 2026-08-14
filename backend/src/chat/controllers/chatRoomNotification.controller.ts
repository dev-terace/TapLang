import { Request, Response } from 'express'

import {
 chatRoomNotificationService
} from '../services/chatRoomNotification.service'

import { userService } from '../../users/services/user.service'

// ==================================================
// 특정 채팅방 알림 설정 조회
// GET /chat-room-notification/:conversationId
// ==================================================

export const getNotification = async (
  req: Request,
  res: Response
) => {

  try {

    const profileId = await userService.findUserIdByAuthToken(req)
    const { conversationId } = req.params


    if (!conversationId) {

      return res.status(400).json({
        message: 'conversationId가 필요합니다.'
      })

    }


    if (!profileId || Number.isNaN(profileId)) {

      return res.status(401).json({
        message: '사용자 정보를 확인할 수 없습니다.'
      })

    }


    const result =
      await chatRoomNotificationService.getChatRoomNotification(
        profileId,
        conversationId
      )


    return res.status(200).json(result)

  } catch (error) {

    console.error(
      '채팅방 알림 설정 조회 실패:',
      error
    )


    return res.status(500).json({
      message: '채팅방 알림 설정 조회에 실패했습니다.'
    })

  }

}


// ==================================================
// 특정 채팅방 알림 ON / OFF
// PATCH /chat-room-notification/:conversationId
// ==================================================

export const updateNotification = async (
  req: Request,
  res: Response
) => {

  try {

    const profileId = await userService.findUserIdByAuthToken(req)
    const { conversationId } = req.params

    const {
      notificationEnabled
    } = req.body


    if (!conversationId) {

      return res.status(400).json({
        message: 'conversationId가 필요합니다.'
      })

    }


    if (!profileId || Number.isNaN(profileId)) {

      return res.status(401).json({
        message: '사용자 정보를 확인할 수 없습니다.'
      })

    }


    if (
      typeof notificationEnabled !== 'boolean'
    ) {

      return res.status(400).json({
        message:
          'notificationEnabled는 boolean이어야 합니다.'
      })

    }


    const result =
      await chatRoomNotificationService.setChatRoomNotification(
        profileId,
        conversationId,
        notificationEnabled
      )


    return res.status(200).json({
      message: '채팅방 알림 설정이 변경되었습니다.',
      data: result
    })

  } catch (error) {

    console.error(
      '채팅방 알림 설정 변경 실패:',
      error
    )


    return res.status(500).json({
      message: '채팅방 알림 설정 변경에 실패했습니다.'
    })

  }

}


// ==================================================
// 특정 채팅방 알림 토글
// POST /chat-room-notification/:conversationId/toggle
// ==================================================

export const toggleNotification = async (
  req: Request,
  res: Response
) => {

  try {

    const profileId = await userService.findUserIdByAuthToken(req)
    const { conversationId } = req.params


    if (!conversationId) {

      return res.status(400).json({
        message: 'conversationId가 필요합니다.'
      })

    }


    if (!profileId || Number.isNaN(profileId)) {

      return res.status(401).json({
        message: '사용자 정보를 확인할 수 없습니다.'
      })

    }


    const result =
      await chatRoomNotificationService.toggleChatRoomNotification(
        profileId,
        conversationId
      )


    return res.status(200).json({
      message: '채팅방 알림 설정이 변경되었습니다.',
      data: result
    })

  } catch (error) {

    console.error(
      '채팅방 알림 토글 실패:',
      error
    )


    return res.status(500).json({
      message: '채팅방 알림 토글에 실패했습니다.'
    })

  }

}