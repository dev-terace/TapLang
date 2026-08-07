import { Request, Response } from "express";
import { userService } from "../../users/services/user.service";
import { chatService } from "../services/chat.service";





export const readConversation = async (
  req: Request,
  res: Response
) => {
  try {

    const { conversationId } = req.params;

    // JWT 미들웨어에서 넣어준 사용자
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