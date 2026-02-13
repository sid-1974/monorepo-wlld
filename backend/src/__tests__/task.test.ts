import "./setup";
import { request, createTestUser, authHeaders } from "./helpers";
import { Task } from "../models";

describe("Task API", () => {
  let token: string;
  let userId: string;

  beforeEach(async () => {
    const testUser = await createTestUser();
    token = testUser.token;
    userId = String(testUser.user._id);
  });

  describe("POST /api/tasks", () => {
    it("should create a task successfully", async () => {
      const res = await request
        .post("/api/tasks")
        .set(authHeaders(token))
        .send({
          title: "Test Task",
          description: "Test description",
          dueDate: "2026-12-31",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Test Task");
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.owner).toBe(userId.toString());
    });

    it("should fail without auth token", async () => {
      const res = await request.post("/api/tasks").send({
        title: "Test Task",
        dueDate: "2026-12-31",
      });

      expect(res.status).toBe(401);
    });

    it("should fail with missing title", async () => {
      const res = await request
        .post("/api/tasks")
        .set(authHeaders(token))
        .send({
          description: "No title",
          dueDate: "2026-12-31",
        });

      expect(res.status).toBe(400);
    });

    it("should fail with invalid due date", async () => {
      const res = await request
        .post("/api/tasks")
        .set(authHeaders(token))
        .send({
          title: "Test Task",
          dueDate: "not-a-date",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks", () => {
    beforeEach(async () => {
      await Task.create([
        {
          title: "Task 1",
          description: "Desc 1",
          status: "pending",
          dueDate: new Date("2026-06-01"),
          owner: userId,
        },
        {
          title: "Task 2",
          description: "Desc 2",
          status: "completed",
          dueDate: new Date("2026-07-01"),
          owner: userId,
        },
        {
          title: "Task 3",
          description: "Desc 3",
          status: "pending",
          dueDate: new Date("2026-08-01"),
          owner: userId,
        },
      ]);
    });

    it("should return all tasks for the user", async () => {
      const res = await request.get("/api/tasks").set(authHeaders(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
    });

    it("should return tasks from cache on subsequent calls", async () => {
      // First call to populate cache
      await request.get("/api/tasks").set(authHeaders(token));

      // Second call should hit cache
      const res = await request.get("/api/tasks").set(authHeaders(token));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
    });

    it("should filter tasks by status", async () => {
      const res = await request
        .get("/api/tasks?status=pending")
        .set(authHeaders(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.every((t: any) => t.status === "pending")).toBe(
        true,
      );
    });

    it("should filter completed tasks", async () => {
      const res = await request
        .get("/api/tasks?status=completed")
        .set(authHeaders(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("completed");
    });

    it("should filter tasks by date range", async () => {
      // Setup: 3 tasks are created in beforeEach with dates:
      // Task 1: 2026-06-01
      // Task 2: 2026-07-01
      // Task 3: 2026-08-01

      const res = await request
        .get("/api/tasks?from=2026-06-15&to=2026-07-15")
        .set(authHeaders(token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Task 2");
    });

    it("should not return tasks from other users", async () => {
      const otherUser = await createTestUser({
        email: "other@example.com",
        name: "Other User",
      });

      const res = await request
        .get("/api/tasks")
        .set(authHeaders(otherUser.token));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: "Original Title",
        description: "Original desc",
        status: "pending",
        dueDate: new Date("2026-12-31"),
        owner: userId,
      });
      taskId = String(task._id);
    });

    it("should update a task successfully", async () => {
      const res = await request
        .put(`/api/tasks/${taskId}`)
        .set(authHeaders(token))
        .send({
          title: "Updated Title",
          status: "completed",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
      expect(res.body.data.status).toBe("completed");
    });

    it("should update task dueDate", async () => {
      const newDate = "2027-01-01";
      const res = await request
        .put(`/api/tasks/${taskId}`)
        .set(authHeaders(token))
        .send({ dueDate: newDate });

      expect(res.status).toBe(200);
      expect(new Date(res.body.data.dueDate).toISOString().split("T")[0]).toBe(
        newDate,
      );
    });

    it("should not update another user's task", async () => {
      const otherUser = await createTestUser({
        email: "other@example.com",
        name: "Other User",
      });

      const res = await request
        .put(`/api/tasks/${taskId}`)
        .set(authHeaders(otherUser.token))
        .send({ title: "Hacked" });

      expect(res.status).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request
        .put(`/api/tasks/${fakeId}`)
        .set(authHeaders(token))
        .send({ title: "Updated" });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    let taskId: string;

    beforeEach(async () => {
      const task = await Task.create({
        title: "To Delete",
        dueDate: new Date("2026-12-31"),
        owner: userId,
      });
      taskId = String(task._id);
    });

    it("should delete a task successfully", async () => {
      const res = await request
        .delete(`/api/tasks/${taskId}`)
        .set(authHeaders(token));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const task = await Task.findById(taskId);
      expect(task).toBeNull();
    });

    it("should not delete another user's task", async () => {
      const otherUser = await createTestUser({
        email: "other@example.com",
        name: "Other User",
      });

      const res = await request
        .delete(`/api/tasks/${taskId}`)
        .set(authHeaders(otherUser.token));

      expect(res.status).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const res = await request
        .delete(`/api/tasks/${fakeId}`)
        .set(authHeaders(token));

      expect(res.status).toBe(404);
    });
  });
});
