import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { registerUser, resetDatabase } from "./helpers.js";
import { testEnv } from "./testEnv.js";

const app = createApp({ authRateLimit: 10_000 });

beforeAll(resetDatabase);
afterAll(() => prisma.$disconnect());

function authCookie(res: request.Response) {
  const cookies = ([] as string[]).concat(res.headers["set-cookie"] ?? []);
  return cookies.find((c) => c.startsWith("access_token="));
}

describe("POST /api/auth/register", () => {
  it("creates the user, returns it without the password, and sets the auth cookie", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "  Alex Doe ", email: " Alex@Example.COM ", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toEqual({
      id: expect.any(Number),
      name: "Alex Doe",
      email: "alex@example.com",
      createdAt: expect.any(String),
    });

    const cookie = authCookie(res);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//);
    // 1 day, allowing for whole-second rounding of the token expiry
    expect(Number(cookie?.match(/Max-Age=(\d+)/)?.[1])).toBeGreaterThan(86390);

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: "alex@example.com" } });
    expect(stored.passwordHash).toMatch(/^\$2b\$12\$/);
  });

  it("rejects a duplicate email regardless of case", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Other", email: "ALEX@example.com", password: "password123" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_TAKEN");
  });

  it.each([
    [{ email: "a@b.com", password: "password123" }, "name"],
    [{ name: "A", email: "not-an-email", password: "password123" }, "email"],
    [{ name: "A", email: "a@b.com", password: "short" }, "password"],
    [{ name: "A", email: "a@b.com", password: "x".repeat(73) }, "password"],
  ])("returns 400 for invalid input %#", async (body, field) => {
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with correct credentials (email is case-insensitive)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ALEX@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("alex@example.com");
    expect(authCookie(res)).toBeDefined();
  });

  it("returns the same generic error for a wrong password and an unknown email", async () => {
    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: "alex@example.com", password: "wrong-password" });
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body.error).toEqual({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
      expect(authCookie(res)).toBeUndefined();
    }
  });
});

describe("GET /api/auth/me", () => {
  it("returns the current user when the cookie is valid", async () => {
    const { agent, user } = await registerUser(app);
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(user.id);
  });

  it("returns 401 without a cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 for a tampered, expired, or wrongly signed token", async () => {
    const { user } = await registerUser(app);
    const expired = jwt.sign({ exp: Math.floor(Date.now() / 1000) - 10 }, testEnv.JWT_SECRET, {
      subject: String(user.id),
    });
    const wrongSecret = jwt.sign({}, "some-other-secret-that-is-long-enough!!", {
      subject: String(user.id),
    });

    for (const token of ["garbage", expired, wrongSecret]) {
      const res = await request(app).get("/api/auth/me").set("Cookie", `access_token=${token}`);
      expect(res.status).toBe(401);
    }
  });

  it("returns 401 if the user was deleted", async () => {
    const { agent, user } = await registerUser(app);
    await prisma.user.delete({ where: { id: user.id } });
    const res = await agent.get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears the cookie so the session no longer works", async () => {
    const { agent } = await registerUser(app);
    const res = await agent.post("/api/auth/logout");
    expect(res.status).toBe(204);
    expect(authCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(401);
  });
});

describe("auth rate limiting", () => {
  it("returns 429 after too many requests", async () => {
    const limitedApp = createApp({ authRateLimit: 2 });
    const attempt = () =>
      request(limitedApp).post("/api/auth/login").send({ email: "x@example.com", password: "x" });

    expect((await attempt()).status).toBe(401);
    expect((await attempt()).status).toBe(401);
    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe("RATE_LIMITED");
  });
});
