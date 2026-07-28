import Redis from "ioredis";

export const redisSubscriber =
  new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });