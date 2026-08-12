import { Request, Response } from "express";
import { chatRoomService } from "../services/chatRoom.service";
import { userService } from "../../users/services/user.service";
import { joinConversationMembers, emitNewMessage } from "../socket/chat.handler"
import { blockUserService } from "../../block/service/block.service";


export const getGroupChatMembers = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;


    if (!conversationId) {
      return res.status(400).json({ message: '대화방 ID(conversationId)가 필요합니다.' });
    }
    console.log("==================================================")
    const members = await chatRoomService.getGroupChatMembers(conversationId);

    return res.status(200).json(members);
  } catch (error) {
    console.error('대화방 멤버 조회 컨트롤러 에러:', error);
    return res.status(500).json({ message: '멤버 목록을 불러오는 중 오류가 발생했습니다.' });
  }
}

export const joinConversation = async (
  req: Request,
  res: Response
) => {
  try {

    console.log("[joinConversation] body:", req.body);
    const {
      conversationId,
      memberIds,
    } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId가 없습니다.",
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "memberIds가 없습니다.",
      });
    }

    // 로그인 유저
    const ownId = await userService.findUserIdByAuthToken(req);

    // 본인도 멤버 목록에 포함
    const targetMemberIds = [
      ...new Set([
        ...memberIds.map(Number),
        ownId,
      ]),
    ];

    // 채팅방 존재 여부
    const exists = await chatRoomService.existsConversation(
      conversationId
    );

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 채팅방입니다.",
      });
    }

    // 실제 채팅방 멤버인지 하나씩 확인
    const validMemberIds: number[] = [];

    for (const userId of targetMemberIds) {
      const isMember =
        await chatRoomService.existsConversationMember(
          conversationId,
          userId
        );

      if (isMember) {
        validMemberIds.push(userId);
      }
    }

    // 아무도 해당 방의 멤버가 아니라면 잘못된 요청
    if (validMemberIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "채팅방 멤버가 없습니다.",
      });
    }

    console.log(
      "[joinConversation] conversationId:",
      conversationId
    );

    console.log(
      "[joinConversation] memberIds:",
      validMemberIds
    );

    // 실제 해당 방의 멤버들만 Socket Room에 join
    joinConversationMembers(
      conversationId,
      validMemberIds,
      ownId
    );

    return res.status(200).json({
      success: true,
      conversationId,
      memberIds: validMemberIds,
    });
  } catch (error) {
    console.error("[joinConversation]", error);

    return res.status(500).json({
      success: false,
      message: "채팅방 입장에 실패했습니다.",
    });
  }
};

export const existsConversation = async (
  req: Request,
  res: Response
) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId가 없습니다.",
      });
    }

    const exists = await chatRoomService.existsConversation(
      conversationId
    );

    return res.status(200).json({
      success: true,
      exists,
    });
  } catch (error) {
    console.error("[existsConversation]", error);

    return res.status(500).json({
      success: false,
      message: "채팅방 존재 여부 확인에 실패했습니다.",
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId, createdAt } = req.params;



    const messages = await chatRoomService.getMessages(
      conversationId,
      createdAt as string | undefined
    );

    const blockerId = await userService.findUserIdByAuthToken(req);

    const result = await blockUserService.getBlockedUsers(Number(blockerId));

    const blockedUserIds = new Set(
      result.blockedUsers.map((user) => Number(user.id))
    );

    const filteredMessages = messages.filter(
      (message) => !blockedUserIds.has(Number(message.senderId))
    );



  

    return res.status(200).json({
      success: true,
      data: filteredMessages,
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
    } = req.body;



    // 로그인 유저
    const ownId = await userService.findUserIdByAuthToken(req);
    const userInfo = await userService.findUserById(ownId);

    let directName = null
    if (name == null && memberIds.length == 1 && chatType == "DIRECT") {
      const receiver = await userService.findUserById(memberIds[0]);

      if (!receiver) {
        return res.status(400).json({
          message: "잘못된 요청입니다!"
        });
      }

      console.log("create chat direct name", directName)
      directName = receiver.name + "|" + userInfo?.name
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
      name == null ? directName : name
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
    const ownId = await userService.findUserIdByAuthToken(req);


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
      createMessage: createMessage
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