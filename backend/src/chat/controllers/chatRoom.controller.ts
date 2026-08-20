import { Request, Response } from "express";
import { chatRoomService } from "../services/chatRoom.service";
import { userService } from "../../users/services/user.service";
import { joinConversationMembers, emitNewMessage } from "../socket/chat.handler"
import { blockUserService } from "../../block/service/block.service";

export const leaveConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params

    const userId = await userService.findUserIdByAuthToken(req)

    if (!userId) {
      return res.status(401).json({
        message: '인증이 필요합니다.',
      })
    }

    if (!conversationId) {
      return res.status(400).json({
        message: 'conversationId가 필요합니다.',
      })
    }

    const result =
      await chatRoomService.leaveConversation(
        conversationId,
        Number(userId),
      )

    return res.status(200).json({
      message: '채팅방에서 나갔습니다.',
      data: result,
    })

  } catch (error) {

    if (
      error instanceof Error &&
      error.message === 'CONVERSATION_MEMBER_NOT_FOUND'
    ) {
      return res.status(404).json({
        message: '채팅방의 멤버가 아닙니다.',
      })
    }

    if (
      error instanceof Error &&
      error.message === 'CONVERSATION_NOT_FOUND'
    ) {
      return res.status(404).json({
        message: '채팅방을 찾을 수 없습니다.',
      })
    }

    console.error(
      '[ConversationController] leaveConversation error:',
      error,
    )

    return res.status(500).json({
      message: '채팅방 나가기에 실패했습니다.',
    })
  }
}


export const getConversationInfo = async (
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

    // 로그인 사용자
    const userId = await userService.findUserIdByAuthToken(req)

    const conversation =
      await chatRoomService.getConversationInfo(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "채팅방을 찾을 수 없습니다.",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    console.error(
      "[getConversationInfo]",
      error
    );

    return res.status(500).json({
      success: false,
      message: "채팅방 정보를 가져오는데 실패했습니다.",
    });
  }
};

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
    const { conversationId, memberIds } = req.body;

    // 1. conversationId 필수 검증
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId가 없습니다.",
      });
    }

    // 로그인 유저
    const ownId = await userService.findUserIdByAuthToken(req);

    if (!ownId) {
      return res.status(401).json({
        success: false,
        message: "인증 정보가 유효하지 않습니다.",
      });
    }

    // 2. memberIds 가 없거나 비어있는 경우 본인 ID를 기본 배열로 사용 (400 에러 방지)
    const rawMemberIds = Array.isArray(memberIds) && memberIds.length > 0 
      ? memberIds 
      : [ownId];

    // 본인도 멤버 목록에 포함 및 숫자 타입 보장
    const targetMemberIds = [
      ...new Set([
        ...rawMemberIds.map(Number),
        Number(ownId),
      ]),
    ];

    // 채팅방 존재 여부 확인
    const exists = await chatRoomService.existsConversation(conversationId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "존재하지 않는 채팅방입니다.",
      });
    }

    // 실제 채팅방 멤버인지 하나씩 확인
    const validMemberIds: number[] = [];

    for (const userId of targetMemberIds) {
      const isMember = await chatRoomService.existsConversationMember(
        conversationId,
        userId
      );

      if (isMember) {
        validMemberIds.push(userId);
      }
    }

    // 아무도 해당 방의 멤버가 아니라면 거부
    if (validMemberIds.length === 0) {
      return res.status(403).json({
        success: false,
        message: "채팅방 멤버가 아닙니다.",
      });
    }

    // // 소켓 룸 입장 처리
    // joinConversationMembers(
    //   conversationId,
    //   validMemberIds,
    //   Number(ownId)
    // );

    return res.status(200).json({
      success: true,
      conversationId,
      memberIds: validMemberIds,
    });
  } catch (error) {
    console.error("[joinConversation] error:", error);

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

    console.log(
      "[createMessage] conversationId:", conversationId);

    console.log(
      "[createMessage] ownId:",
      ownId
    );
    if (content == null) {
      return res.status(400).json({
        message: "메시지를 입력해주세요!"
      });
    }



    const memberCount = await chatRoomService.getMemberCount(conversationId);

    // 2. 멤버가 1명 이하(혼자 남아있거나 아무도 없는 경우)면 메시지 전송 차단
    if (memberCount <= 1) {
      return res.status(400).json({
        message: "대화 상대가 없거나 채팅방을 나갔습니다."
      });
    }

    const createdMessage = await chatRoomService.createMessage(conversationId, ownId, content, attachments)

    const userInfo = await userService.findUserById(ownId)

    const conversationInfo = await chatRoomService.getConversationInfo(conversationId, ownId);


    if (!userInfo) {
      throw new Error("유저 없음");
    }


    emitNewMessage(conversationId, createdMessage, userInfo, conversationInfo.name);


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


export const inviteMembers = async (req: Request, res: Response) => {
  try {
    const { conversationId, memberIds, memberId } = req.body;
    const ownId = await userService.findUserIdByAuthToken(req);

    if (!ownId) {
      return res.status(401).json({
        success: false,
        message: "인증 정보가 유효하지 않습니다.",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId가 필요합니다.",
      });
    }

    // 단일 memberId와 배열 memberIds 모두 수용 가능하도록 보장
    const targets = memberIds ?? (memberId ? [memberId] : []);

    if (!targets || targets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "초대할 대상(memberId/memberIds)이 필요합니다.",
      });
    }

    const result = await chatRoomService.inviteMembers(
      conversationId,
      ownId,
      targets
    );

    // 1. 초대된 유저 소켓 룸(conversation:id) 참가 처리
    // joinConversationMembers(conversationId, result.invitedUserIds, ownId);

    // 2. 채팅방에 초대 실시간 메시지(소켓 이벤트) 전송
    if (result.systemMessage && result.inviter) {
      emitNewMessage(
        conversationId,
        {
          id: result.systemMessage.id,
          conversationId,
          senderId: ownId,
          senderName: result.inviter.name,
          content: result.systemMessage.content, // 예: "XXX님이 YYY님을 초대했습니다."
          attachments: null,
          createdAt: result.systemMessage.createdAt || new Date().toISOString(),
          flag: result.inviter.flag || "kr",
        },
        {
          id: ownId,
          name: result.inviter.name,
          flag: result.inviter.flag || "kr",
          statusMsg: result.inviter.statusMsg || null,
        },
        result.conversationName || "그룹 채팅"
      );
    }
    
    return res.status(200).json({
      success: true,
      message: "멤버가 성공적으로 초대되었습니다.",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "CONVERSATION_NOT_FOUND":
          return res.status(404).json({ success: false, message: "존재하지 않는 채팅방입니다." });
        case "NOT_A_GROUP_CHAT":
          return res.status(400).json({ success: false, message: "그룹 채팅방에서만 초대가 가능합니다." });
        case "NOT_A_ROOM_MEMBER":
          return res.status(403).json({ success: false, message: "채팅방 멤버만 초대를 수행할 수 있습니다." });
        case "ALREADY_MEMBERS":
          return res.status(400).json({ success: false, message: "이미 채팅방에 참여 중인 유저입니다." });
      }
    }

    console.error("[inviteMembers] Error:", error);
    return res.status(500).json({
      success: false,
      message: "멤버 초대 처리 중 오류가 발생했습니다.",
    });
  }
};