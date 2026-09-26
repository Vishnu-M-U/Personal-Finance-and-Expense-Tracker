import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type TestAgent from "supertest/lib/agent.js";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { registerUser, resetDatabase } from "./helpers.js";

const app = createApp({ authRateLimit: 10_000 });
let agent: TestAgent;

beforeAll(async () => {
  await resetDatabase();
  ({ agent } = await registerUser(app));
});
afterAll(() => prisma.$disconnect());

describe("GET /api/categories", () => {
  it("requires authentication", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(401);
  });

  it("lists all 18 categories, income first, then by name", async () => {
    const res = await agent.get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(18);
    expect(res.body.data[0]).toEqual({ id: expect.any(Number), name: "Business", type: "INCOME" });
    expect(res.body.data[6].type).toBe("EXPENSE");
  });

  it("filters by type", async () => {
    const res = await agent.get("/api/categories?type=EXPENSE");
    expect(res.body.data).toHaveLength(12);
    expect(res.body.data.every((c: { type: string }) => c.type === "EXPENSE")).toBe(true);
  });

  it("rejects an invalid type", async () => {
    const res = await agent.get("/api/categories?type=SAVINGS");
    expect(res.status).toBe(400);
  });
});
