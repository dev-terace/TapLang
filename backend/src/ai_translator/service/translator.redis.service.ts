import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

const USER_LIMIT = 30;
const IP_LIMIT = 100;
const WINDOW_SECONDS = 60;

export const translatorRedisService = {

  async checkRateLimit(userId: number, ip: string): Promise<{
    allowed: boolean;
    userRemaining: number;
    ipRemaining: number;
  }> {

    const userKey = `translate:user:${userId}`;
    const ipKey = `translate:ip:${ip}`;

    const userCount = await redis.incr(userKey);

    if (userCount === 1) {
      await redis.expire(userKey, WINDOW_SECONDS);
    }

    const ipCount = await redis.incr(ipKey);

    if (ipCount === 1) {
      await redis.expire(ipKey, WINDOW_SECONDS);
    }

    const userRemaining = Math.max(0, USER_LIMIT - userCount);
    const ipRemaining = Math.max(0, IP_LIMIT - ipCount);

    if (userCount > USER_LIMIT || ipCount > IP_LIMIT) {
      return {
        allowed: false,
        userRemaining,
        ipRemaining,
      };
    }

    return {
      allowed: true,
      userRemaining,
      ipRemaining,
    };
  },
};