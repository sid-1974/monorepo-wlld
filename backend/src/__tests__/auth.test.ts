import "./setup";
import { request, createTestUser } from "./helpers";

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("should create a new user successfully", async () => {
      const res = await request.post("/api/auth/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe("John Doe");
      expect(res.body.data.user.email).toBe("john@example.com");
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should fail with duplicate email", async () => {
      await createTestUser({ email: "john@example.com" });

      const res = await request.post("/api/auth/signup").send({
        name: "Jane Doe",
        email: "john@example.com",
        password: "password123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("should fail with invalid email", async () => {
      const res = await request.post("/api/auth/signup").send({
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail with short password", async () => {
      const res = await request.post("/api/auth/signup").send({
        name: "John Doe",
        email: "john@example.com",
        password: "123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should fail with missing fields", async () => {
      const res = await request.post("/api/auth/signup").send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createTestUser({
        email: "login@example.com",
        password: "password123",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe("login@example.com");
    });

    it("should fail with wrong password", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should fail with non-existent email", async () => {
      const res = await request.post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
