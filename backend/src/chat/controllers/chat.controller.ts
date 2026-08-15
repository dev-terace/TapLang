import { Request, Response } from "express";
import { userService } from "../../users/services/user.service";
import { chatService } from "../services/chat.service";
import { blockUserService } from "../../block/service/block.service";
import { chatRoomNotificationService } from "../services/chatRoomNotification.service";




export const readConversation = async (
  req: Request,
  res: Response
) => {
  try {

    const { conversationId } = req.params;


    const ownId = await userService.findUserIdByAuthToken(req)


    const result = await chatService.readConversation(
      conversationId,
      ownId
    );


    return res.status(200).json({
      success: true,
      data: result
    });


  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "읽음 처리 실패"
    });

  }
};



export const getMyConversations = async (req: Request, res: Response) => {
  const ownId = await userService.findUserIdByAuthToken(req);

  const result = await chatService.getMyConversations(ownId);
  
  
  const conversations = await Promise.all(
  result.data.map(async (conversation) => {
    const notification =
      await chatRoomNotificationService.getChatRoomNotification(
        ownId,
        conversation.conversationId
      );

    // 알림이 꺼진 경우에만 notification: false 추가
    if (!notification.notificationEnabled) {
      return {
        ...conversation,
        notification: false
      };
    }

    return conversation;
  })
);  

  const blockedResult =
    await blockUserService.getBlockedUsers(ownId);

  const blockedUserIds = new Set(
    blockedResult.blockedUsers.map((user) => user.id)
  );

  const filteredData = conversations
    .map((conversation) => {
      // 차단된 유저 제거
      const members = conversation.members.filter(
        (member) => !blockedUserIds.has(member.userId)
      );

      // 차단되지 않은 멤버가 하나도 없으면
      // 해당 conversation 자체를 제거
      if (members.length === 0) {
        return null;
      }

      // 나머지 key/value는 전부 원본 유지
      return {
        ...conversation,

        // members만 필터링
        members,

        // 마지막 메시지 발신자가 차단 유저면 content만 ""
        lastMessage:
          conversation.lastMessage &&
            blockedUserIds.has(conversation.lastMessage.senderId)
            ? {
              ...conversation.lastMessage,
              content: "",
            }
            : conversation.lastMessage,
      };
    })
    .filter((conversation) => conversation !== null);

  // ⭐ 최종 구조 유지
  const filteredResult = {
    ...result,
    data: filteredData,
  };

  console.log(
    "filteredResult:",
    JSON.stringify(filteredResult, null, 2)
  );


  return res.status(200).json(filteredResult);
}

export const getConversationUnreadCounts = async (
  req: Request,
  res: Response
) => {
  try {
    const ownId = await userService.findUserIdByAuthToken(req);

    const result = await chatService.getConversationUnreadCounts(ownId);

    console.log("result : ", result);

    return res.status(200).json(result);

  } catch (error) {
    console.error("getConversationUnreadCounts: ", error);

    return res.status(500).json({
      message: "읽지 않은 메시지 조회 실패"
    });
  }

} 