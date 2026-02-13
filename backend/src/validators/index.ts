import { z } from "zod";

// Auth validation schemas
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z.string().email("Please provide a valid email").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .default("")
    .optional(),
  status: z.enum(["pending", "completed"]).default("pending").optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please provide a valid date",
    }),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional(),
  status: z.enum(["pending", "completed"]).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please provide a valid date",
    })
    .optional(),
});

export const taskQuerySchema = z.object({
  status: z.enum(["pending", "completed"]).optional(),
  sortBy: z
    .enum(["dueDate", "createdAt", "title"])
    .default("createdAt")
    .optional(),
  order: z.enum(["asc", "desc"]).default("desc").optional(),
});

// Type inference for reuse
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
