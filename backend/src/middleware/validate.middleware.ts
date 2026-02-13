import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "./error.middleware";

// Reusable validation middleware using Zod
export const validate =
  (schema: ZodSchema, source: "body" | "query" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.errors.map(
        (e) => `${e.path.join(".")}: ${e.message}`,
      );
      throw new AppError(messages.join(", "), 400);
    }

    req[source] = result.data;
    next();
  };
