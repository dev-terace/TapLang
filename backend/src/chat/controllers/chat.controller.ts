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
  const { cursor, limit } = req.query;

  // ✅ blocked 목록을 먼저 조회해서 서비스에 넘김
  const blockedResult = await blockUserService.getBlockedUsers(ownId);
  const blockedUserIds = blockedResult.blockedUsers.map((user) => user.id);

  const result = await chatService.getMyConversations(
    ownId,
    limit ? Number(limit) : 10,
    cursor ? JSON.parse(cursor as string) : undefined,
    blockedUserIds // ✅ 추가
  );

  const conversations = await Promise.all(
    result.data.map(async (conversation) => {
      const notification =
        await chatRoomNotificationService.getChatRoomNotification(
          ownId,
          conversation.conversationId
        );

      if (!notification.notificationEnabled) {
        return { ...conversation, notification: false };
      }
      return conversation;
    })
  );

  // ✅ 이제 members는 이미 서비스 단에서 차단 유저 없이 걸러져 왔으므로
  //    여기서는 lastMessage content만 블라인드 처리하면 됨 (방 개수 필터링 X)
  const blockedSet = new Set(blockedUserIds);
  const finalData = conversations.map((conversation) => ({
    ...conversation,
    lastMessage:
      conversation.lastMessage &&
      blockedSet.has(conversation.lastMessage.senderId)
        ? { ...conversation.lastMessage, content: "" }
        : conversation.lastMessage,
  }));

  const filteredResult = {
    ...result,
    data: finalData,
  };

  return res.status(200).json(filteredResult);
};

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