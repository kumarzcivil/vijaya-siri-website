import Redis from "ioredis";

let redis;
let isRedisAvailable = false;

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
    isRedisAvailable = true;
    console.log("Redis connected");
  });

  redis.on("ready", () => {
    isRedisAvailable = true;
  });

  redis.on("close", () => {
    isRedisAvailable = false;
  });

  redis.on("error", (err) => {
    isRedisAvailable = false;
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

const isRedisReady = () => {
  return redis && isRedisAvailable && redis.status === "ready";
};

export { connectRedis, getRedis, isRedisReady };
