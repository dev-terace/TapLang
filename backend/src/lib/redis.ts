import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
});

(async () => {
  await redis.config(
    "SET",
    "notify-keyspace-events",
    "Ex"
  );

  console.log(
    "Redis keyspace notification enabled"
  );
})();