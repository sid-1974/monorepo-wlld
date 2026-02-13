import express from "express";
import cors from "cors";
import "express-async-errors";
import routes from "./routes";
import { errorHandler } from "./middleware";
import { connectDB } from "./config/database";
import { getRedisClient } from "./config/redis";

const app = express();

// Establish DB connections (for Serverless cold starts)
connectDB().catch((err) => console.error("Initial DB connect failed:", err));
getRedisClient().catch((err) =>
  console.error("Initial Redis connect failed:", err),
);

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

export default app;
