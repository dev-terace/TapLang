import { redis } from "../lib/redis";

const PREFIX = "online:";
const TTL = 60;

const addOnlineUser = async (
  userId: number,
  socketId: string
) => {

  await redis.set(
    `${PREFIX}${userId}`,
    socketId, 
    "EX",
    TTL
  );

};

const heartbeat = async (
  userId: number,
  socketId: string
) => {

  const key = `${PREFIX}${userId}`;

  const currentSocket =
    await redis.get(key);


  // 이미 다른 소켓이면 무시
  if (
    currentSocket &&
    currentSocket !== socketId
  ) {
    return false;
  }


  await redis.expire(
    key,
    TTL
  );

  return true;

};

const removeOnlineUser = async (
  userId:number,
  socketId:string
)=> {

  const key =
    `${PREFIX}${userId}`;


  const current =
    await redis.get(key);


  // 다른 세션이면 삭제하면 안됨
  if(current !== socketId){
    return;
  }


  await redis.del(key);

};

const isOnline = async (
  userId: number
): Promise<boolean> => {

  return (
    await redis.exists(
      `${PREFIX}${userId}`
    )
  ) === 1;

};

const getOnlineUsers = async (): Promise<number[]> => {

  const keys = await redis.keys(
    `${PREFIX}*`
  );

  return keys.map(key =>
    Number(
      key.replace(PREFIX, "")
    )
  );

};

export const friendsRedisService = {
  addOnlineUser,
  heartbeat,
  removeOnlineUser,
  isOnline,
  getOnlineUsers,
};