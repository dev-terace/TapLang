import { Request, Response } from "express";
import { friendsService } from "../services/friends.service";

export const findFriends = async (req: Request, res: Response) => {
    try {
      const ownId = Number(req.params.ownId);
      const friends = await friendsService.getFriends(ownId);
      


      res.status(200).json({
        message: "친구 목록 조회 성공",
        friends,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "친구 목록 조회 실패",
      });
    }
  };


  export const addFriend = async (req: Request, res: Response) => {
    try {
      const ownId = Number(req.params.ownId);
      const friendId = Number(req.params.friendId)

      const friends = await friendsService.addFriend(ownId, friendId);

      res.status(200).json({
        message: "친구 등록 성공",
        friends,
      });
      
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "친구 등록 실패",
      });
    }
  };