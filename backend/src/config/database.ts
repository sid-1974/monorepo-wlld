import mongoose from "mongoose";
import { config } from "../config";

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(config.mongodbUri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // Don't exit process in Vercel
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
};
