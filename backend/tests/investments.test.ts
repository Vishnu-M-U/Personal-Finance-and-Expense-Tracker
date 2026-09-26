import request from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { registerUser, resetDatabase } from "./helpers.js";

const app = createApp({ authRateLimit: 10_000 });

let alice: TestAgent;
let bob: TestAgent;

beforeAll(async () => {
  await resetDatabase();
  ({ agent: alice } = await registerUser(app));
  ({ agent: bob } = await registerUser(app));
});
afterAll(() => prisma.$disconnect());

beforeEach(async () => {
  await prisma.investment.deleteMany();
});

const fundBody = () => ({
  name: "Nippon Small Cap",
  type: "MUTUAL_FUND",
  investedAmount: 50000,
  currentValue: "58000",
});

function create(agent: TestAgent, body: Record<string, unknown>) {
  return agent.post("/api/investments").send(body);
}

describe("authentication", () => {
  it.each([
    ["get", "/api/investments"],
    ["post", "/api/investments"],
    ["get", "/api/investments/1"],
    ["patch", "/api/investments/1"],
    ["delete", "/api/investments/1"],
  ] as const)("%s %s requires auth", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/investments", () => {
  it("creates an investment with its return", async () => {
    const res = await create(alice, fundBody());
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(Number),
      name: "Nippon Small Cap",
      type: "MUTUAL_FUND",
      investedAmount: "50000.00",
      currentValue: "58000.00",
      returnAmount: "8000.00",
      returnPercentage: 16,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("allows a current value of zero and reports the loss", async () => {
    const res = await create(alice, { ...fundBody(), currentValue: 0 });
    expect(res.status).toBe(201);
    expect(res.body.data.returnAmount).toBe("-50000.00");
    expect(res.body.data.returnPercentage).toBe(-100);
  });

  it.each([
    ["an empty name", { name: "   " }, "name"],
    ["an unknown type", { type: "LOTTERY" }, "type"],
    ["a zero invested amount", { investedAmount: 0 }, "investedAmount"],
    ["a negative current value", { currentValue: -1 }, "currentValue"],
    ["too many decimals", { currentValue: "1.234" }, "currentValue"],
  ])("rejects %s", async (_label, change, field) => {
    const res = await create(alice, { ...fundBody(), ...change });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });
});

describe("GET /api/investments", () => {
  it("returns zero totals and no allocation for an empty portfolio", async () => {
    const res = await alice.get("/api/investments");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: [],
      summary: {
        totalInvested: "0.00",
        currentValue: "0.00",
        totalReturn: "0.00",
        returnPercentage: 0,
        allocation: [],
      },
    });
  });

  it("lists only the user's investments, newest first, with portfolio totals", async () => {
    await create(alice, fundBody());
    await create(alice, {
      ...fundBody(),
      name: "Parag Parikh Flexicap",
      investedAmount: 60000,
      currentValue: 69000,
    });
    await create(alice, {
      name: "Gold ETF",
      type: "GOLD",
      investedAmount: 40000,
      currentValue: 45500,
    });
    await create(bob, { ...fundBody(), name: "Bob's fund" });

    const res = await alice.get("/api/investments");
    expect(res.status).toBe(200);
    expect(res.body.data.map((i: { name: string }) => i.name)).toEqual([
      "Gold ETF",
      "Parag Parikh Flexicap",
      "Nippon Small Cap",
    ]);
    expect(res.body.summary).toEqual({
      totalInvested: "150000.00",
      currentValue: "172500.00",
      totalReturn: "22500.00",
      returnPercentage: 15,
      allocation: [
        { type: "MUTUAL_FUND", currentValue: "127000.00", percentage: 73.62 },
        { type: "GOLD", currentValue: "45500.00", percentage: 26.38 },
      ],
    });
  });

  it("reports a negative total return", async () => {
    await create(alice, {
      name: "Crypto",
      type: "CRYPTO",
      investedAmount: 10000,
      currentValue: 7550.5,
    });
    const res = await alice.get("/api/investments");
    expect(res.body.summary.totalReturn).toBe("-2449.50");
    expect(res.body.summary.returnPercentage).toBe(-24.5);
  });
});

describe("GET, PATCH and DELETE /api/investments/:id", () => {
  it("gets one investment", async () => {
    const { body } = await create(alice, fundBody());
    const res = await alice.get(`/api/investments/${body.data.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Nippon Small Cap");
  });

  it("updates only the given fields and recalculates the return", async () => {
    const { body } = await create(alice, fundBody());
    const res = await alice.patch(`/api/investments/${body.data.id}`).send({ currentValue: 45000 });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: "Nippon Small Cap",
      currentValue: "45000.00",
      returnAmount: "-5000.00",
      returnPercentage: -10,
    });
  });

  it("rejects an empty update", async () => {
    const { body } = await create(alice, fundBody());
    const res = await alice.patch(`/api/investments/${body.data.id}`).send({});
    expect(res.status).toBe(400);
  });

  it("deletes an investment", async () => {
    const { body } = await create(alice, fundBody());
    await alice.delete(`/api/investments/${body.data.id}`).expect(204);
    await alice.get(`/api/investments/${body.data.id}`).expect(404);
  });

  it("hides other users' investments", async () => {
    const { body } = await create(bob, fundBody());
    const id = body.data.id;
    await alice.get(`/api/investments/${id}`).expect(404);
    await alice.patch(`/api/investments/${id}`).send({ currentValue: 1 }).expect(404);
    await alice.delete(`/api/investments/${id}`).expect(404);
    const res = await bob.get(`/api/investments/${id}`);
    expect(res.body.data.currentValue).toBe("58000.00");
  });
});
