import { Request, Response } from "express";
import request from "supertest";
import app from "../app";
import { errorHandler } from "../middleware/error.middleware";
import { sendError, sendSuccess } from "../utils/response.util";

describe("Error Handling & Response Utils", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("API Handlers", () => {
    it("should return 404 for unknown routes", async () => {
      const res = await request(app).get("/api/unknown-route");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: "Route not found",
      });
    });

    it("should return 200 for health check", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe("errorHandler Middleware", () => {
    it("should handle Mongoose ValidationError", () => {
      const error = {
        name: "ValidationError",
        errors: {
          field1: { message: "Field 1 is required" },
          field2: { message: "Field 2 must be a string" },
        },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining("Field 1 is required"),
        }),
      );
    });

    it("should handle Mongoose Duplicate Key Error (11000)", () => {
      const error = {
        code: 11000,
        keyValue: { email: "test@example.com" },
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already exists",
        }),
      );
    });

    it("should handle Mongoose CastError", () => {
      const error = {
        name: "CastError",
        path: "_id",
        value: "invalid-id",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid _id: invalid-id",
        }),
      );
    });

    it("should handle generic AppError with custom status code", () => {
      const error = {
        statusCode: 403,
        message: "Forbidden access",
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Forbidden access",
      });
    });

    it("should fallback to 500 for unknown errors", () => {
      const error = new Error("Something went wrong");

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Something went wrong",
        }),
      );
    });
  });

  describe("Response Utilities", () => {
    it("should send success response with default values", () => {
      const data = { id: 1 };
      sendSuccess(mockResponse as Response, data);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Success",
        data,
      });
    });

    it("should send error response with default status code", () => {
      sendError(mockResponse as Response, "Default error");
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it("should send error response with custom values", () => {
      sendError(mockResponse as Response, "Custom error", 401);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Custom error",
      });
    });
  });
});
