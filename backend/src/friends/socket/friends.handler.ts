
import { Socket, Server } from "socket.io";
import { friendsService } from "../services/friends.service";
import { friendsRedisService } from "../services/friends.redis.service";



export const registerHeartBeatEvents = (socket: Socket) => {
  socket.on("friend:heartbeat", async (callback) => {
    const ownId = socket.data.userId;

    console.log("heartbeat 실행 : ", ownId)
    await friendsRedisService.heartbeat(ownId, socket.id)

    callback();
  });
};

//병목 시 redis에서 온라인 친구 목록을 가져와서 체크하게 끔 최적화해야함
export const registerFriendEvents = (io: Server, socket: Socket) => {


  socket.on("friend:own:init", async () => {

    const ownId = socket.data.userId;

    console.log("registerFriendEvent : ownId:", ownId);

    // 반드시 먼저 등록
    await friendsRedisService.addOnlineUser(
      ownId,
      socket.id
    );

    const friends = await friendsService.getFriends(ownId);


    const onlineFriends = await Promise.all(
      friends.map(async (friend) => {

        const isOnline =
          await friendsRedisService.isOnline(friend.id);

        return isOnline ? friend.id : null;
      })
    );


    for (const friendId of onlineFriends) {

      if (!friendId) continue;

      console.log(
        "친구 온라인 알림",
        friendId,
        ownId
      );

      io.to(`user:${friendId}`)
        .emit(
          "friend:online",
          ownId
        );

      io.to(`user:${ownId}`)
        .emit(
          "friend:online",
          friendId
        );
    }

  });

};