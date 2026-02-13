import { User } from "../models";
import { generateToken } from "../utils";
import { AppError } from "../middleware";
import { SignupInput, LoginInput } from "../validators";

export class AuthService {
  /**
   * Register a new user and return JWT token
   */
  static async signup(input: SignupInput) {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    const user = await User.create(input);
    const token = generateToken(String(user._id));

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Authenticate user and return JWT token
   */
  static async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(String(user._id));

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    };
  }
}
