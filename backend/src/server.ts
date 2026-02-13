import app from "./app";
import { config } from "./config";
import { connectDB } from "./config/database";
import { getRedisClient } from "./config/redis";

const start = async (): Promise<void> => {
  try {
    // Connect to databases
    await connectDB();
    await getRedisClient();

    // Start server only if not running in Vercel environment
    if (process.env.VERCEL !== "1") {
      app.listen(config.port, () => {
        console.log(`🚀 Server running on http://localhost:${config.port}`);
        console.log(`📋 Health check: http://localhost:${config.port}/health`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
};

// Check if we are in Vercel – if not, run the start function
if (process.env.VERCEL !== "1") {
  start();
}

export default app;
