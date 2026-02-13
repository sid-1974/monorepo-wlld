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
  getAll: (filters: { status?: string; from?: string; to?: string } = {}) => {
    const params: any = {};
    if (filters.status && filters.status !== "all")
      params.status = filters.status;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    return api.get<ApiResponse<Task[]>>("/tasks", { params });
  },

  create: (data: TaskFormData) => api.post<ApiResponse<Task>>("/tasks", data),

  update: (id: string, data: Partial<TaskFormData>) =>
    api.put<ApiResponse<Task>>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<null>>(`/tasks/${id}`),
};
