import { Request, Response } from "express";
import { AuthService } from "../services";
import { sendSuccess } from "../utils";

export class AuthController {
  static async signup(req: Request, res: Response): Promise<void> {
    const result = await AuthService.signup(req.body);
    sendSuccess(res, result, "User registered successfully", 201);
  }

  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);
    sendSuccess(res, result, "Login successful");
  }
}
