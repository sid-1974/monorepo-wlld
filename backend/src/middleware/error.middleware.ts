import { Request, Response, NextFunction } from "express";

// Custom error class for API errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error handler middleware
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors).map(
      (e: any) => e.message,
    );
    res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate field value. Please use another value.",
    });
    return;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
