import jwt, { SignOptions } from "jsonwebtoken";
import { config } from "../config";

export const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };
  return jwt.sign({ id: userId }, config.jwt.secret as string, options);
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, config.jwt.secret as string) as { id: string };
};
