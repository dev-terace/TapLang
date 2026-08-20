import { Request, Response } from "express";
import { chatRoomService } from "../../custom_chat/service/customChat.service";
import { joinConversationMembers, emitNewMessage } from "../../chat/socket/chat.handler"
import { userService } from "../../users/services/user.service";
import { chatRoomService as prevChatRoomSerive } from "../../chat/services/chatRoom.service";
import { joinConversationMembers } from "../../chat/socket/chat.handler";



export const joinConversation = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("[joinConversation] body:", req.body)

    const { conversationId } = req.body

    // 1. conversationId 검증
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId가 필요합니다.",
      })
    }

    // 2. 로그인 사용자
    const ownId = await userService.findUserIdByAuthToken(req)

    if (!ownId) {
      return res.status(401).json({
        success: false,
        message: "인증 정보가 유효하지 않습니다.",
      })
    }

    const numericOwnId = Number(ownId)

    // 3. 채팅방 존재 여부 확인
    const exists =
      await prevChatRoomSerive.existsConversation(
        conversationId
      )

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 채팅방입니다.",
      })
    }

    // 4. 현재 사용자가 실제 채팅방 멤버인지 확인
    const isMember =
      await prevChatRoomSerive.existsConversationMember(
        conversationId,
        numericOwnId
      )

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "채팅방 멤버가 아닙니다.",
      })
    }

    // 5. DB에서 현재 채팅방의 모든 멤버 조회
    const memberIds =
      await chatRoomService.getCustomChatMemberIds(
        conversationId
      )

    console.log(
      "[joinConversation] conversationId:",
      conversationId
    )

    console.log(
      "[joinConversation] memberIds:",
      memberIds
    )

    // 6. 현재 접속 중인 멤버들의 socket을
    //    conversation room에 참가시킴
    joinConversationMembers(
      conversationId,
      memberIds,
      numericOwnId
    )

    return res.status(200).json({
      success: true,
      conversationId,
      memberIds,
    })

  } catch (error) {

    console.error(
      "[joinConversation] error:",
      error
    )

    return res.status(500).json({
      success: false,
      message: "채팅방 입장에 실패했습니다.",
    })
  }
}


export const joinCustomChat = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = await userService.findUserIdByAuthToken(req)
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        message: "conversationId가 필요합니다.",
      });
    }

    if (!userId || Number.isNaN(userId)) {
      return res.status(401).json({
        message: "인증된 사용자를 확인할 수 없습니다.",
      });
    }

    const result =
      await chatRoomService.joinCustomChat(
        conversationId,
        userId
      );
    
    joinConversationMembers(conversationId, [], userId);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "[CUSTOM CHAT] 채팅방 참가 오류:",
      error
    );

    if (!(error instanceof Error)) {
      return res.status(500).json({
        message: "CUSTOM 채팅방 참가에 실패했습니다.",
      });
    }

    switch (error.message) {
      case "CONVERSATION_NOT_FOUND":
        return res.status(404).json({
          message: "채팅방을 찾을 수 없습니다.",
        });

      case "NOT_A_GROUP_CHAT":
        return res.status(400).json({
          message: "CUSTOM 채팅방이 아닙니다.",
        });

      default:
        return res.status(500).json({
          message: "CUSTOM 채팅방 참가에 실패했습니다.",
        });
    }
  }
};