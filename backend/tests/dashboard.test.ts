import request from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { currentMonthRange } from "../src/utils/dates.js";
import { categoryId, registerUser, resetDatabase } from "./helpers.js";

const app = createApp({ authRateLimit: 10_000 });

let alice: TestAgent;
let bob: TestAgent;
let ids: Record<string, number>;

const SEPTEMBER = "startDate=2026-09-01&endDate=2026-09-30";

beforeAll(async () => {
  await resetDatabase();
  ({ agent: alice } = await registerUser(app));
  ({ agent: bob } = await registerUser(app));
  ids = {
    salary: await categoryId("Salary"),
    freelance: await categoryId("Freelance"),
    rent: await categoryId("Rent & Housing"),
    groceries: await categoryId("Groceries"),
    travel: await categoryId("Travel"),
  };

  const rows: [string, string, string, string][] = [
    // type, category, amount, date
    ["INCOME", "salary", "85000.00", "2026-09-01"],
    ["INCOME", "freelance", "15000.00", "2026-09-15"],
    ["EXPENSE", "rent", "20000.00", "2026-09-03"],
    ["EXPENSE", "groceries", "0.10", "2026-09-10"],
    ["EXPENSE", "groceries", "0.20", "2026-09-11"],
    ["EXPENSE", "groceries", "4999.70", "2026-09-12"],
    ["EXPENSE", "groceries", "1000.00", "2026-09-30"],
    // Outside September — must be ignored
    ["EXPENSE", "travel", "50000.00", "2026-08-31"],
    ["EXPENSE", "travel", "50000.00", "2026-10-01"],
  ];
  for (const [type, category, amount, date] of rows) {
    await alice
      .post("/api/transactions")
      .send({ type, amount, date, categoryId: ids[category] })
      .expect(201);
  }
  // Another user's data — must never appear in Alice's dashboard
  await bob
    .post("/api/transactions")
    .send({ type: "INCOME", amount: 1, date: "2026-09-05", categoryId: ids.salary })
    .expect(201);
});
afterAll(() => prisma.$disconnect());
afterEach(() => vi.useRealTimers());

describe("GET /api/dashboard/summary", () => {
  it("requires authentication", async () => {
    expect((await request(app).get("/api/dashboard/summary")).status).toBe(401);
  });

  it("returns exact totals for the period", async () => {
    const res = await alice.get(`/api/dashboard/summary?${SEPTEMBER}`);
    expect(res.status).toBe(200);
    expect(res.body.data.period).toEqual({ startDate: "2026-09-01", endDate: "2026-09-30" });
    // expenses: 20000 + 0.10 + 0.20 + 4999.70 + 1000 = 26000.00
    expect(res.body.data.totals).toEqual({
      income: "100000.00",
      expense: "26000.00",
      balance: "74000.00",
    });
  });

  it("breaks down each type by category, largest first, with percentages", async () => {
    const res = await alice.get(`/api/dashboard/summary?${SEPTEMBER}`);
    expect(res.body.data.expenseByCategory).toEqual([
      { categoryId: ids.rent, name: "Rent & Housing", total: "20000.00", percentage: 76.92 },
      { categoryId: ids.groceries, name: "Groceries", total: "6000.00", percentage: 23.08 },
    ]);
    expect(res.body.data.incomeByCategory).toEqual([
      { categoryId: ids.salary, name: "Salary", total: "85000.00", percentage: 85 },
      { categoryId: ids.freelance, name: "Freelance", total: "15000.00", percentage: 15 },
    ]);
  });

  it("returns the 5 most recent transactions in the period", async () => {
    const res = await alice.get(`/api/dashboard/summary?${SEPTEMBER}`);
    const recent = res.body.data.recentTransactions;
    expect(recent.map((t: { date: string }) => t.date)).toEqual([
      "2026-09-30",
      "2026-09-15",
      "2026-09-12",
      "2026-09-11",
      "2026-09-10",
    ]);
    expect(recent[0]).toMatchObject({
      type: "EXPENSE",
      amount: "1000.00",
      category: { name: "Groceries" },
    });
  });

  it("allows a negative balance", async () => {
    const res = await alice.get("/api/dashboard/summary?startDate=2026-08-01&endDate=2026-08-31");
    expect(res.body.data.totals).toEqual({
      income: "0.00",
      expense: "50000.00",
      balance: "-50000.00",
    });
    expect(res.body.data.incomeByCategory).toEqual([]);
    expect(res.body.data.expenseByCategory[0].percentage).toBe(100);
  });

  it("returns zeros and empty lists for a period with no data", async () => {
    const res = await alice.get("/api/dashboard/summary?startDate=2020-01-01&endDate=2020-01-31");
    expect(res.body.data).toEqual({
      period: { startDate: "2020-01-01", endDate: "2020-01-31" },
      totals: { income: "0.00", expense: "0.00", balance: "0.00" },
      expenseByCategory: [],
      incomeByCategory: [],
      recentTransactions: [],
    });
  });

  it("defaults to the current month", async () => {
    vi.useFakeTimers({ toFake: ["Date"], now: new Date(2026, 8, 17, 12) }); // 17 Sep 2026
    const res = await alice.get("/api/dashboard/summary");
    expect(res.body.data.period).toEqual({ startDate: "2026-09-01", endDate: "2026-09-30" });
    expect(res.body.data.totals.expense).toBe("26000.00");
  });

  it.each(["startDate=2026-09-30&endDate=2026-09-01", "startDate=2026-13-01", "endDate=yesterday"])(
    "rejects invalid query %s",
    async (query) => {
      const res = await alice.get(`/api/dashboard/summary?${query}`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    },
  );
});

describe("currentMonthRange", () => {
  it.each([
    [new Date(2026, 1, 10), "2026-02-01", "2026-02-28"],
    [new Date(2028, 1, 10), "2028-02-01", "2028-02-29"],
    [new Date(2026, 11, 31, 23, 59), "2026-12-01", "2026-12-31"],
    [new Date(2026, 0, 1, 0, 0), "2026-01-01", "2026-01-31"],
  ])("%s → %s..%s", (now, startDate, endDate) => {
    expect(currentMonthRange(now)).toEqual({ startDate, endDate });
  });
});
