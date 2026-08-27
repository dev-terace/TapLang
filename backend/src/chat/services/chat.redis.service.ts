import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

redis.on("error", (error) => {
  console.error("[Redis Error]", error);
});

const WINDOW_SECONDS = 1;
const MAX_REQUESTS = 2;

export const chatRedisService = {

  async checkMessageRateLimit(
    userId: number
  ): Promise<boolean> {

    const key = `chat:message:user:${userId}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(
        key,
        WINDOW_SECONDS
      );
    }

    return count <= MAX_REQUESTS;
  },
};