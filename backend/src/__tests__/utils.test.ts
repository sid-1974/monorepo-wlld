import { NextFunction, Request, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { generateToken, verifyToken } from "../utils";
import { AppError } from "../middleware";

describe("Utils & Middleware", () => {
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

  describe("Auth Middleware", () => {
    let mockRequest: Partial<AuthRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockResponse = {};
      nextFunction = jest.fn();
    });

    it("should call next() if token is valid", () => {
      const token = generateToken("user123");
      mockRequest.headers!.authorization = `Bearer ${token}`;

      authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userId).toBe("user123");
    });

    it("should throw AppError if authorization header is missing", () => {
      expect(() => {
        authenticate(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow(AppError);
    });

    it("should throw AppError if token is invalid", () => {
      mockRequest.headers!.authorization = "Bearer invalid-token";

      expect(() => {
        authenticate(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction,
        );
      }).toThrow("Invalid or expired token.");
    });
  });
});
