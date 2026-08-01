import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { userService } from "../../users/services/user.service";

export const createChat = async (
  req: Request,
  res: Response
) => {

  console.log("받은 body:", req.body);
console.log("memberIds:", req.body.memberIds);
console.log("chatType:", req.body.chatType);

  try {
    const {
      memberIds,
      chatType,
      name
    } = req.body;

    // 로그인 유저
    const ownId =  await userService.findUserIdByAuthToken(req); 


    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        message: "memberIds가 필요합니다."
      });
    }

    if (
      chatType !== "DIRECT" &&
      chatType !== "GROUP"
    ) {
      return res.status(400).json({
        message: "잘못된 채팅 타입입니다."
      });
    }


    const conversation = await chatService.createChatInfo(
      memberIds,
      ownId,
      chatType,
      name
    );


    return res.status(201).json({
      conversationId: conversation.id
    });

  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "채팅 생성 실패"
    });
  }
};