// services/presenceExpiredService.ts

import { redisSubscriber } from "../lib/redisSubscriber";
import { friendsRedisService } from "./friends.redis.service";
import { friendsService } from "./friends.service";
import { getSocketIO } from "../socket/socket";


const PREFIX = "online:";



export const startPresenceExpiredListener =
async()=>{

  const io = getSocketIO();
  await redisSubscriber.psubscribe(
    "__keyevent@0__:expired"
  );



  redisSubscriber.on(
    "pmessage",
    async(
      _pattern,
      _channel,
      key
    )=>{


      if(
        !key.startsWith(PREFIX)
      ){
        return;
      }



      /**
       * TTL 만료된 사용자
       */
      const offlineUserId =
        Number(
          key.replace(
            PREFIX,
            ""
          )
        );



      /**
       * 친구 목록 조회
       */

      console.log("friend.expired.redis service  offlineUserId",  offlineUserId)
      const friends =
        await friendsService.getFriends(
          offlineUserId
        );



      if(
        !friends.length
      ){
        return;
      }



      /**
       * 친구 online 상태 병렬 체크
       */
      const onlineResults =
        await Promise.all(
          friends.map(
            friend =>
              friendsRedisService.isOnline(
                friend.id
              )
          )
        );



      /**
       * online 친구에게만 emit
       */
      friends.forEach(
        (
          friend,
          index
        )=>{


          if(
            !onlineResults[index]
          ){
            return;
          }



                    console.log(
            "friend offline emit",
            {
                offlineUserId,
                friendId: friend.id
            }
            );
          io.to(
            `user:${friend.id}`
          )
          .emit(
            "friend:offline", offlineUserId)
        }
      );


    }
  );


};