import { redis } from "../../lib/redis";

const PREFIX = "online:";
const TTL = 90;

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

const expireOnlineUser = async (
  userId: number,
  socketId: string
) => {
  const key = `${PREFIX}${userId}`;

  const current = await redis.get(key);

  // 다른 세션이면 만료시키면 안 됨
  if (current !== socketId) {
    return;
  }

  // 60초 후 자동 삭제
  await redis.expire(key, 1);
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
  expireOnlineUser,
  isOnline,
  getOnlineUsers,
};