import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "./error.middleware";

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  id: string;
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.userId = decoded.id;
    next();
  } catch {
    throw new AppError("Invalid or expired token.", 401);
  }
};
