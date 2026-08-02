import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import { userService } from "../../users/services/user.service";
import { getSocketIO, userSockets } from "../../socket/socket";
import {joinConversationMembers, emitNewMessage} from "../socket/chat.handler"

//  conversationId: string;
//       senderId: string;
//       content: string;



export const createChat = async (
  req: Request,
  res: Response
) => {

console.log("받은 body:", req.body);
console.log("memberIds:", req.body.memberIds);
console.log("chatType:", req.body.chatType);
console.log("message: ", req.body.message)
  try {
    const {
      memberIds,
      chatType,
      name,
      message
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
    
    const createdMessage = await chatService.createMessage(conversation.id, ownId, message)
    
    joinConversationMembers(conversation.id, memberIds, ownId);

    emitNewMessage(conversation.id, createdMessage);
    


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