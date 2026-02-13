import "./setup";
import { generateToken, verifyToken } from "../utils";
import { AppError } from "../middleware";

describe("Utils", () => {
  describe("JWT Utils", () => {
    it("should generate and verify a token", () => {
      const token = generateToken("user123");
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = verifyToken(token);
      expect(decoded.id).toBe("user123");
    });

    it("should throw on invalid token", () => {
      expect(() => verifyToken("invalid-token")).toThrow();
    });
  });

  describe("AppError", () => {
    it("should create an error with status code", () => {
      const error = new AppError("Not Found", 404);
      expect(error.message).toBe("Not Found");
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });
});
