import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

// Mock Redis module before any imports
jest.mock("../config/redis", () => {
  const store = new Map<string, { value: string; expiry?: number }>();

  return {
    getRedisClient: jest.fn().mockResolvedValue({
      get: jest.fn((key: string) => {
        const item = store.get(key);
        if (!item) return null;
        if (item.expiry && item.expiry < Date.now()) {
          store.delete(key);
          return null;
        }
        return item.value;
      }),
      setEx: jest.fn((key: string, ttl: number, value: string) => {
        store.set(key, { value, expiry: Date.now() + ttl * 1000 });
      }),
      keys: jest.fn((pattern: string) => {
        const prefix = pattern.replace("*", "");
        return Array.from(store.keys()).filter((k) => k.startsWith(prefix));
      }),
      del: jest.fn((keys: string[]) => {
        keys.forEach((k) => store.delete(k));
      }),
      isOpen: true,
    }),
    disconnectRedis: jest.fn(),
    cacheGet: jest.fn(async (key: string) => {
      const item = store.get(key);
      if (!item) return null;
      if (item.expiry && item.expiry < Date.now()) {
        store.delete(key);
        return null;
      }
      return item.value;
    }),
    cacheSet: jest.fn(async (key: string, value: string, ttl = 300) => {
      store.set(key, { value, expiry: Date.now() + ttl * 1000 });
    }),
    cacheInvalidate: jest.fn(async (pattern: string) => {
      const prefix = pattern.replace("*", "");
      Array.from(store.keys())
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => store.delete(k));
    }),
    __clearStore: () => store.clear(),
  };
});

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  // Clear Redis mock store
  const { __clearStore } = require("../config/redis");
  __clearStore();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
