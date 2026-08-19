import { Request, Response } from "express";
import { chatRoomService } from "../../custom_chat/service/customChat.service";
import { joinConversationMembers, emitNewMessage } from "../../chat/socket/chat.handler"
import { userService } from "../../users/services/user.service";

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