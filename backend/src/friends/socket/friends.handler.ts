
import { Socket, Server } from "socket.io";
import { friendsService } from "../services/friends.service";
import { friendsRedisService } from "../services/friends.redis.service";
import { getSocketIO, userSockets } from "../../socket/socket";

export const emitReloadFriendsInfo = (senderId: number, receiverId: number) => {
    const io = getSocketIO()

    io.to(`user:${senderId}`)
    .emit("friend:reload", {
      reload: true,
    });

    io.to(`user:${receiverId}`)
    .emit("friend:reload", {
      reload: true,
    });

}

export const registerHeartBeatEvents = (socket: Socket) => {
  socket.on("friend:heartbeat", async (callback) => {
    const ownId = socket.data.userId;

    await friendsRedisService.heartbeat(ownId, socket.id)

    callback();
  });
};

//병목 시 redis에서 온라인 친구 목록을 가져와서 체크하게 끔 최적화해야함
export const registerFriendEvents = (io: Server, socket: Socket) => {


  socket.on("friend:own:init", async () => {

    const ownId = socket.data.userId;


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