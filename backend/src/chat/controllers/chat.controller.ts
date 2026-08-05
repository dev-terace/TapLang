import { Request, Response } from "express";
import { userService } from "../../users/services/user.service";
import { chatService } from "../services/chat.service";


export const getMyConversations = async(req: Request, res: Response) => {
    const ownId = await userService.findUserIdByAuthToken(req);

    const result = await chatService.getMyConversations(ownId);
    
    
    console.log(JSON.stringify(result, null, 2))

    return res.status(200).json(result);
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