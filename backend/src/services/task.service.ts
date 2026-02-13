import { Task } from "../models";
import { AppError } from "../middleware";
import { cacheGet, cacheSet, cacheInvalidate } from "../config/redis";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
} from "../validators";

const CACHE_PREFIX = "tasks";
const buildCacheKey = (userId: string, query?: TaskQueryInput): string => {
  const parts = [CACHE_PREFIX, userId];
  if (query?.status) parts.push(`status:${query.status}`);
  if (query?.sortBy) parts.push(`sort:${query.sortBy}`);
  if (query?.order) parts.push(`order:${query.order}`);
  return parts.join(":");
};

export class TaskService {
  /**
   * Get all tasks for a user with optional filtering and sorting
   */
  static async getTasks(userId: string, query: TaskQueryInput = {}) {
    const cacheKey = buildCacheKey(userId, query);

    // Check cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build query
    const filter: Record<string, any> = { owner: userId };
    if (query.status) filter.status = query.status;

    const sortField = query.sortBy || "createdAt";
    const sortOrder = query.order === "asc" ? 1 : -1;

    const tasks = await Task.find(filter)
      .sort({ [sortField]: sortOrder })
      .lean();

    // Cache the result
    await cacheSet(cacheKey, JSON.stringify(tasks));

    return tasks;
  }

  /**
   * Create a new task
   */
  static async createTask(userId: string, input: CreateTaskInput) {
    const task = await Task.create({
      ...input,
      dueDate: new Date(input.dueDate),
      owner: userId,
    });

    // Invalidate user's task cache
    await cacheInvalidate(`${CACHE_PREFIX}:${userId}*`);

    return task;
  }

  /**
   * Update an existing task (only if owned by user)
   */
  static async updateTask(
    taskId: string,
    userId: string,
    input: UpdateTaskInput,
  ) {
    const updateData: Record<string, any> = { ...input };
    if (input.dueDate) {
      updateData.dueDate = new Date(input.dueDate);
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, owner: userId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!task) {
      throw new AppError("Task not found or unauthorized", 404);
    }

    await cacheInvalidate(`${CACHE_PREFIX}:${userId}*`);

    return task;
  }

  /**
   * Delete a task (only if owned by user)
   */
  static async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findOneAndDelete({ _id: taskId, owner: userId });

    if (!task) {
      throw new AppError("Task not found or unauthorized", 404);
    }

    await cacheInvalidate(`${CACHE_PREFIX}:${userId}*`);
  }
}
