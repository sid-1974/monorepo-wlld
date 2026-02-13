import "./setup";
import { User } from "../models/user.model";
import { Task } from "../models/task.model";
import mongoose from "mongoose";

describe("Models", () => {
  describe("User Model", () => {
    it("should not re-hash password if it is not modified", async () => {
      const user = await User.create({
        name: "Test User",
        email: "model@example.com",
        password: "password123",
      });

      const originalPassword = user.password;

      // Update name - should not trigger password re-hash
      user.name = "Updated Name";
      await user.save();

      expect(user.password).toBe(originalPassword);
      expect(user.name).toBe("Updated Name");
    });
  });

  describe("Task Model", () => {
    it("should create a task with default status", async () => {
      const userId = new mongoose.Types.ObjectId();
      const task = await Task.create({
        title: "Default Task",
        dueDate: new Date(),
        owner: userId,
      });

      expect(task.status).toBe("pending");
      expect(task.owner.toString()).toBe(userId.toString());
    });
  });
});
