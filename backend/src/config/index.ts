import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/task-tracker",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  isTest: process.env.NODE_ENV === "test",
} as const;
