
import { Socket, Server } from "socket.io";
import { friendsService } from "../services/friends.service";
import { friendsRedisService } from "../services/friends.redis.service";



export const registerHeartBeatEvents = (socket: Socket) => {
    socket.on("friend:heartbeat", async (callback) => {
      const ownId =  socket.data.userId;

      console.log("heartbeat 실행 : ", ownId)
      await friendsRedisService.heartbeat(ownId, socket.id)

      callback();
    });
}; 

//병목 시 redis에서 온라인 친구 목록을 가져와서 체크하게 끔 최적화해야함
export const registerFriendEvents = (io: Server, socket: Socket) => {
   
    
    socket.on("friend:own:init", async (data) => {
         const ownId =  socket.data.userId;

         console.log("registerFriendEvent : ownId: ", ownId)
         const friends = await friendsService.getFriends(ownId)
         await friendsRedisService.addOnlineUser(ownId, socket.id)
         
      for (const friend of friends) {

        const isOnline = await friendsRedisService.isOnline(friend.id);

        if (!isOnline) { continue;}
        
        console.log("친구한테 온라인 알림 전송 "+ friend.id + " ", ownId )
        io.to(`user:${friend.id}`)
          .emit("friend:online", ownId);
        
        io.to(`user:${ownId}`).emit("friend:online", friend.id);  
          
      }

    });

};