import supertest from "supertest";
import app from "../app";
import { User } from "../models";
import { generateToken } from "../utils";

// Reusable test helpers
export const request = supertest(app);

export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    ...overrides,
  };

  const user = await User.create(defaultUser);
  const token = generateToken(String(user._id));

  return { user, token };
};

export const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});
