import { redis } from "../lib/redis";

const PREFIX = "online:";

const addOnlineUser = async (
  userId: number,
  socketId: string
) => {

  await redis.set(
    `${PREFIX}${userId}`,
    socketId,
    "EX",
    60
  );

};

const heartbeat = async (
  userId: number,
  socketId: string
) => {

  await redis.set(
    `${PREFIX}${userId}`,
    socketId,
    "EX",
    60
  );

};

const removeOnlineUser = async (
  userId: number
) => {

  await redis.del(
    `${PREFIX}${userId}`
  );

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

export const onlineUsersService = {
  addOnlineUser,
  heartbeat,
  removeOnlineUser,
  isOnline,
  getOnlineUsers,
};