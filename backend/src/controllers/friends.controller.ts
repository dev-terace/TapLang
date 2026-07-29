import { Request, Response } from "express";
import { friendsService } from "../services/friends.service";
import { friendReqService } from "../services/friendReq.service";
import { userService } from "../services/user.service";

export const findFriends = async (req: Request, res: Response) => {
    try {

      
      const ownId =  await userService.findUserIdByAuthToken(req); 
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


  export const findReqFriends = async (req: Request, res: Response) => {
    try {
      const ownId =  await userService.findUserIdByAuthToken(req); 

      console.log("findReqFriends ownId: " + ownId)
      const friends = await friendReqService.findRequestFriends(ownId)
      
      res.status(200).json({
        message: "친구 목록 조회 성공!!!",
        friends,
      });


    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "친구 목록 조회 실패",
      });
    }
  };


  export const reqFriend = async (req: Request, res: Response) => {
    try {
       const { searchName } = req.body;

      const senderId =  await userService.findUserIdByAuthToken(req); 
      
       

      console.log("[friends.controller] senderId : " + senderId + ", searchName : "+searchName)
      const receiver = await friendsService.searchFriend(searchName)
 
      if (senderId === receiver?.id) {
        return res.status(409).json({
          message: "자기 자신은 친구 추가할 수 없습니다.",
        });
      }
      else if(!receiver)
      {
          return res.status(404).json({
          message: "친구 정보가 없습니다.",
        });
      }

      console.log("friends.controller senderId : "+ senderId + ", receiverId : " + receiver.id )
      const friend = await friendReqService.sendFriendRequest(senderId, receiver.id)
      

      return res.status(200).json({
        message: "친구 추가 성공",
        friend,
      });

    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        return res.status(409).json({
          message: error.message,
        });
      }

       return res.status(500).json({
        message: "친구 검색 실패",
        });

    }
  }


  export const addFriend = async (req: Request, res: Response) => {
    try {
      const ownId =  await userService.findUserIdByAuthToken(req); 
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