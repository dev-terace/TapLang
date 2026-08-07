import { Request, Response } from "express";
import { chatRoomService } from "../services/chatRoom.service";
import { userService } from "../../users/services/user.service";
import {joinConversationMembers, emitNewMessage} from "../socket/chat.handler"




export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId, createdAt } = req.params;


    
    const messages = await chatRoomService.getMessages(
      conversationId,
      createdAt as string | undefined
    );


    console.log("controller createdAt, ", createdAt)

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "메시지를 불러오는데 실패했습니다.",
    });
  }
};

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
    const userInfo  = await userService.findUserById(ownId);
    
    let directName = null
    if(name == null)
    {
      const receiver = await userService.findUserById(memberIds[0]);

      if (!receiver) {
      return res.status(400).json({
        message: "잘못된 요청입니다!"
      });
    }

      directName = receiver.name + "|"+userInfo?.name
    }
    

    if (!Array.isArray(memberIds)) {
      return res.status(400).json({
        message: "잘못된 요청입니다!"
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




    
    const conversation = await chatRoomService.createChatInfo(
      memberIds,
      ownId,
      chatType,
      name == null ? directName: name
    );
    

    

    joinConversationMembers(conversation.id, memberIds, ownId);

    console.log("[createChat] convId", conversation.id)
    console.log("[createChat] convId", memberIds)

    


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



export const createMessage = async (
  req: Request,
  res: Response
) => {


  try {
    const {
      conversationId,
      content,
      attachments
    } = req.body;

    // 로그인 유저
    const ownId =  await userService.findUserIdByAuthToken(req); 


    if (content == null) {
      return res.status(400).json({
        message: "메시지를 입력해주세요!"
      });
    }



   const isExist = await chatRoomService.existsConversationMember(conversationId, ownId)
   
    if (!isExist) {
      return res.status(400).json({
        message: "잘못된 요청입니다!"
      });
    }

   const createdMessage = await chatRoomService.createMessage(conversationId, ownId, content)
    
   const userInfo = await userService.findUserById(ownId)


    if (!userInfo) {
    throw new Error("유저 없음");
    }

    emitNewMessage(conversationId, createdMessage, userInfo);


    return res.status(201).json({
      createMessage : createMessage
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