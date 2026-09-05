import Redis from "ioredis";

let redis;

const connectRedis = () => {
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy(times) {
      if (times > 5) {
        console.warn("Redis: max retries reached, running without cache");
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redis.connect().catch(() => {});

  redis.on("connect", () => {
    console.log("Redis connected");
  });

  redis.on("error", (err) => {
    if (err.message.includes("ECONNREFUSED")) {
      // silent on first few attempts
    } else {
      console.error("Redis error:", err.message);
    }
  });

  return redis;
};

const getRedis = () => {
  if (!redis) {
    throw new Error("Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};

export { connectRedis, getRedis };
