import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "express-async-errors";
import routes from "./routes";
import { errorHandler } from "./middleware";
import { connectDB } from "./config/database";
import { getRedisClient } from "./config/redis";

const app = express();

// Connection Middleware for Serverless
const connectionGuard = async (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    // Await both connections before proceeding
    await connectDB();
    await getRedisClient();
    next();
  } catch (error) {
    console.error("❌ Database connection failed in middleware:", error);
    next(error);
  }
};

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply connection guard to all API routes
app.use("/api", connectionGuard, routes);

// Health check (bypasses guard for speed)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

export default app;
