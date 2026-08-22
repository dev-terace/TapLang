import { Request, Response } from "express";

import { userService } from "../../users/services/user.service";
import { chatRoomService } from "../service/customChat.service";
import argon2 from 'argon2';






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



      
    let passwordHash: string | undefined;

    if (password) {
      passwordHash = await argon2.hash(password);
    }

    // 채팅방 생성
    const conversation =
      await chatRoomService.createChatInfo({
        ownId,
        name,
        description,
        password : passwordHash,
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


export const getMyCustomChats = async (
  req: Request,
  res: Response
) => {
  try {

    // 인증된 사용자 ID 가져오기
    const userId =
      await userService.findUserIdByAuthToken(req)

    if (!userId) {
      return res.status(401).json({
        message: "로그인이 필요합니다.",
      })
    }

    // cursor 파싱
    let cursor

    if (typeof req.query.cursor === "string") {
      try {
        cursor = JSON.parse(req.query.cursor)
      } catch {
        return res.status(400).json({
          message: "잘못된 cursor입니다.",
        })
      }
    }

    // 내가 가입한 CUSTOM 채팅방 조회
    const result =
      await chatRoomService.getMyCustomChats(
        userId,
        cursor
      )

    return res.status(200).json(result)

  } catch (error: any) {

    console.error(
      "내 CUSTOM 채팅방 조회 오류:",
      error
    )

    switch (error.message) {

      case "USER_ID_REQUIRED":
        return res.status(400).json({
          message: "사용자 정보가 없습니다.",
        })

      case "INVALID_CURSOR":
        return res.status(400).json({
          message: "잘못된 cursor입니다.",
        })

      case "CONVERSATION_NOT_FOUND":
        return res.status(404).json({
          message: "채팅방을 찾을 수 없습니다.",
        })

      default:
        return res.status(500).json({
          message:
            "CUSTOM 채팅방 조회 중 오류가 발생했습니다.",
        })
    }
  }
}