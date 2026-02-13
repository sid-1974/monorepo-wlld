import app from "./app";
import { config } from "./config";
import { connectDB } from "./config/database";
import { getRedisClient } from "./config/redis";

const start = async (): Promise<void> => {
  try {
    // Connect to databases
    await connectDB();
    await getRedisClient();

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📋 Health check: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

start();
