import { createClient, RedisClientType } from "redis";
import { config } from "../config";

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({ url: config.redisUrl });

  redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err);
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected");
  });

  await redisClient.connect();
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
    console.log("🔌 Redis disconnected");
  }
};

// Cache helpers — reusable across services
const CACHE_TTL = 300; // 5 minutes

export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const client = await getRedisClient();
    return await client.get(key);
  } catch {
    console.warn("⚠️ Redis cache get failed, skipping cache");
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: string,
  ttl = CACHE_TTL,
): Promise<void> => {
  try {
    const client = await getRedisClient();
    await client.setEx(key, ttl, value);
  } catch {
    console.warn("⚠️ Redis cache set failed, skipping cache");
  }
};

export const cacheInvalidate = async (pattern: string): Promise<void> => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch {
    console.warn("⚠️ Redis cache invalidation failed");
  }
};
