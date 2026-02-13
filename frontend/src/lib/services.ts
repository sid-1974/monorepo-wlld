import api from "./api";
import { ApiResponse, AuthResponse, Task, TaskFormData } from "@/types";

// Auth endpoints
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/signup", data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),
};

// Task endpoints
export const taskApi = {
  getAll: (status?: string) =>
    api.get<ApiResponse<Task[]>>("/tasks", {
      params: status && status !== "all" ? { status } : {},
    }),

  create: (data: TaskFormData) => api.post<ApiResponse<Task>>("/tasks", data),

  update: (id: string, data: Partial<TaskFormData>) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),
};
