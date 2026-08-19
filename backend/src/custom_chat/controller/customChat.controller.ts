import { Request, Response } from "express";

import { userService } from "../../users/services/user.service";
import { chatRoomService } from "../service/customChat.service";

export const createCustomChat = async (
  req: Request,
  res: Response
) => {

  console.log("[createCustomChat] body:", req.body);

  try {

    const {
      name,
      description,
      password,
    } = req.body;


    // 로그인한 사용자 ID
    const ownId =
      await userService.findUserIdByAuthToken(req);


    // 채팅방 생성
    const conversation =
      await chatRoomService.createChatInfo({
        ownId,
        name,
        description,
        password,
      });


    console.log(
      "[createCustomChat] conversationId:",
      conversation.id
    );


    return res.status(201).json({
      conversationId: conversation.id,
    });

  } catch (error) {

    console.error(
      "[createCustomChat] 채팅방 생성 오류:",
      error
    );


    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "채팅방 생성에 실패했습니다.",
    });
  }
};

export const getCustomChats = async (
  req: Request,
  res: Response
) => {
  try {

    let cursor;

    if (typeof req.query.cursor === "string") {
      try {
        cursor = JSON.parse(req.query.cursor);
      } catch {
        return res.status(400).json({
          message: "잘못된 cursor입니다.",
        });
      }
    }

    const result =
      await chatRoomService.getCustomChats(
        cursor
      );

    return res.status(200).json(result);

  } catch (error) {

    console.error(
      "[getCustomChats]",
      error
    );

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "커스텀 채팅방 목록을 불러오지 못했습니다.",
    });
  }
};