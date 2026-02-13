import { Response } from "express";
import { AuthRequest } from "../middleware";
import { TaskService } from "../services";
import { sendSuccess } from "../utils";

export class TaskController {
  static async getTasks(req: AuthRequest, res: Response): Promise<void> {
    const tasks = await TaskService.getTasks(req.userId!, req.query as any);
    sendSuccess(res, tasks, "Tasks retrieved successfully");
  }

  static async createTask(req: AuthRequest, res: Response): Promise<void> {
    const task = await TaskService.createTask(req.userId!, req.body);
    sendSuccess(res, task, "Task created successfully", 201);
  }

  static async updateTask(req: AuthRequest, res: Response): Promise<void> {
    const task = await TaskService.updateTask(
      req.params.id,
      req.userId!,
      req.body,
    );
    sendSuccess(res, task, "Task updated successfully");
  }

  static async deleteTask(req: AuthRequest, res: Response): Promise<void> {
    await TaskService.deleteTask(req.params.id, req.userId!);
    sendSuccess(res, null, "Task deleted successfully");
  }
}
