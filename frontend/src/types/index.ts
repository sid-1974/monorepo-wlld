// Shared types used across the frontend
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

export type TaskStatus = "pending" | "completed";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string;
}

export type TaskFilter = "all" | "pending" | "completed";
