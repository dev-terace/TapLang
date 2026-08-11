import { Request, Response } from "express";
import { friendsService } from "../services/friends.service";
import { friendReqService } from "../services/friendReq.service";
import { userService } from "../../users/services/user.service";
import { emitReloadFriendsInfo } from "../socket/friends.handler";
import { blockUserService } from "../../block/service/block.service";
export const findFriends = async (req: Request, res: Response) => {
  try {

    const ownId = await userService.findUserIdByAuthToken(req);
    const friends = await friendsService.getFriends(ownId);

    console.log("findFriends : ", friends)

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
    // 1. 내 ID 가져오기 (숫자 변환 필수)
    const rawOwnId = await userService.findUserIdByAuthToken(req);
    const ownId = Number(rawOwnId);

    if (!ownId || isNaN(ownId)) {
      return res.status(401).json({ error: "유효하지 않은 사용자입니다." });
    }

    // 2. 서비스 호출
    const friends = await friendReqService.findRequestFriends(ownId);
    const blockResult = await blockUserService.getBlockedUsers(ownId);

    // 3. 차단 목록 ID Set 만들기
    const blockedList = blockResult.blockedUsers || [];
    const blockedUserIds = new Set(blockedList.map(user => Number(user.id)));

    // 4. 필터링 로직


    const filteredFriends = friends.filter((friend) => {
      const targetId = Number(friend.id);


      console.log("findReqFriends blockedList", blockedList)
      console.log("findReqFriends targetId", targetId)

      if (friend.status === 'RECEIVED') {
        // 차단 목록에 없는(!)(정상 유저) 경우에만 true를 반환하여 유지

        console.log("findReqFriends blockedUserIds.has : ", blockedUserIds.has(targetId))
        return !blockedUserIds.has(targetId);
      }

      // 내가 보낸 요청('SENT') 등 그 외의 상태는 전부 목록에 그대로 포함
      return true;
    });

    // 🚨 5. 가장 중요한 부분: filteredFriends를 응답으로 보내야 함!
    return res.status(200).json(filteredFriends);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "서버 에러가 발생했습니다." });
  }
};


export const reqFriend = async (req: Request, res: Response) => {
  try {
    const { searchName } = req.body;

    const senderId = await userService.findUserIdByAuthToken(req);



    console.log("[friends.controller] senderId : " + senderId + ", searchName : " + searchName)
    const receiver = await friendsService.searchFriend(searchName)

    if (senderId === receiver?.id) {
      return res.status(409).json({
        message: "자기 자신은 친구 추가할 수 없습니다.",
      });
    }
    else if (!receiver) {
      return res.status(404).json({
        message: "친구 정보가 없습니다.",
      });
    }

    console.log("friends.controller senderId : " + senderId + ", receiverId : " + receiver.id)
    const friend = await friendReqService.sendFriendRequest(senderId, receiver.id)


    emitReloadFriendsInfo(senderId, receiver.id);

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
    const ownId = await userService.findUserIdByAuthToken(req);
    const friendId = Number(req.params.friendId)

    const friends = await friendReqService.addFriend(ownId, friendId);


    emitReloadFriendsInfo(ownId, friendId);

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


export const deleteFriendRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const ownId = await userService.findUserIdByAuthToken(req)
    const friendId = Number(req.params.friendId);
    const self = req.params.self === "true";
    console.log(`deleteFriendRequest ownId: ${ownId}, friendId: ${friendId}`);

    console.log("===========================================", self);
    if (self) {
      await friendReqService.deleteFriendRequest(ownId, friendId);
    } else {

      await friendReqService.deleteFriendRequest(friendId, ownId);
    }

    emitReloadFriendsInfo(ownId, friendId);

    return res.status(200).json({
      message: "친구 요청이 취소되었습니다.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "친구 요청 취소에 실패했습니다.",
    });
  }
};