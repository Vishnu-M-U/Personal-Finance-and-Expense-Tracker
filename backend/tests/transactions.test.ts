import request from "supertest";
import type TestAgent from "supertest/lib/agent.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { categoryId, registerUser, resetDatabase } from "./helpers.js";

const app = createApp({ authRateLimit: 10_000 });

let alice: TestAgent;
let bob: TestAgent;
let groceries: number;
let rent: number;
let salary: number;

beforeAll(async () => {
  await resetDatabase();
  ({ agent: alice } = await registerUser(app));
  ({ agent: bob } = await registerUser(app));
  groceries = await categoryId("Groceries");
  rent = await categoryId("Rent & Housing");
  salary = await categoryId("Salary");
});
afterAll(() => prisma.$disconnect());

beforeEach(async () => {
  await prisma.transaction.deleteMany();
});

function create(agent: TestAgent, body: Record<string, unknown>) {
  return agent.post("/api/transactions").send(body);
}

const groceryBody = () => ({
  type: "EXPENSE",
  amount: 1250.5,
  date: "2026-09-20",
  categoryId: groceries,
  description: "Weekly groceries",
});

describe("authentication", () => {
  it.each([
    ["get", "/api/transactions"],
    ["post", "/api/transactions"],
    ["get", "/api/transactions/1"],
    ["patch", "/api/transactions/1"],
    ["delete", "/api/transactions/1"],
  ] as const)("%s %s requires auth", async (method, path) => {
    const res = await request(app)[method](path);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/transactions", () => {
  it("creates a transaction and returns it in the API format", async () => {
    const res = await create(alice, groceryBody());
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      id: expect.any(Number),
      type: "EXPENSE",
      amount: "1250.50",
      date: "2026-09-20",
      description: "Weekly groceries",
      category: { id: groceries, name: "Groceries", type: "EXPENSE" },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("accepts a string amount and stores an empty description as null", async () => {
    const res = await create(alice, { ...groceryBody(), amount: "99.9", description: "  " });
    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe("99.90");
    expect(res.body.data.description).toBeNull();
  });

  it("round-trips the date exactly when read back", async () => {
    const created = await create(alice, { ...groceryBody(), date: "2026-01-01" });
    const fetched = await alice.get(`/api/transactions/${created.body.data.id}`);
    expect(fetched.body.data.date).toBe("2026-01-01");
  });

  it.each([
    [{ amount: 0 }, "amount"],
    [{ amount: -5 }, "amount"],
    [{ amount: 10.123 }, "amount"],
    [{ amount: "abc" }, "amount"],
    [{ amount: "10000000000" }, "amount"],
    [{ date: "2026-02-30" }, "date"],
    [{ date: "20-09-2026" }, "date"],
    [{ type: "SAVINGS" }, "type"],
    [{ categoryId: "abc" }, "categoryId"],
    [{ description: "x".repeat(256) }, "description"],
  ])("rejects invalid input %o", async (override, field) => {
    const res = await create(alice, { ...groceryBody(), ...override });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.map((d: { field: string }) => d.field)).toContain(field);
  });

  it("accepts the maximum amount", async () => {
    const res = await create(alice, { ...groceryBody(), amount: "9999999999.99" });
    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe("9999999999.99");
  });

  it("rejects a category of the wrong type", async () => {
    const res = await create(alice, { ...groceryBody(), categoryId: salary });
    expect(res.status).toBe(400);
    expect(res.body.error.details).toEqual([
      { field: "categoryId", message: "Category does not match transaction type" },
    ]);
  });

  it("rejects an unknown category", async () => {
    const res = await create(alice, { ...groceryBody(), categoryId: 999999 });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].message).toBe("Category not found");
  });
});

describe("GET /api/transactions/:id", () => {
  it("returns 404 for another user's transaction", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await bob.get(`/api/transactions/${body.data.id}`);
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("returns 400 for a non-numeric id", async () => {
    const res = await alice.get("/api/transactions/abc");
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/transactions/:id", () => {
  it("updates only the given fields", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice
      .patch(`/api/transactions/${body.data.id}`)
      .send({ amount: "1300.00", description: "Groceries + snacks" });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      amount: "1300.00",
      description: "Groceries + snacks",
      date: "2026-09-20",
      category: { id: groceries },
    });
  });

  it("can clear the description with null", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice.patch(`/api/transactions/${body.data.id}`).send({ description: null });
    expect(res.body.data.description).toBeNull();
  });

  it("rejects changing the type alone when the category no longer matches", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice.patch(`/api/transactions/${body.data.id}`).send({ type: "INCOME" });
    expect(res.status).toBe(400);
    expect(res.body.error.details[0].field).toBe("categoryId");
  });

  it("allows changing type and category together", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice
      .patch(`/api/transactions/${body.data.id}`)
      .send({ type: "INCOME", categoryId: salary });
    expect(res.status).toBe(200);
    expect(res.body.data.type).toBe("INCOME");
  });

  it("rejects an empty body", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice.patch(`/api/transactions/${body.data.id}`).send({});
    expect(res.status).toBe(400);
  });

  it("returns 404 for another user's transaction and leaves it unchanged", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await bob.patch(`/api/transactions/${body.data.id}`).send({ amount: 1 });
    expect(res.status).toBe(404);
    const unchanged = await alice.get(`/api/transactions/${body.data.id}`);
    expect(unchanged.body.data.amount).toBe("1250.50");
  });
});

describe("DELETE /api/transactions/:id", () => {
  it("deletes the transaction", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await alice.delete(`/api/transactions/${body.data.id}`);
    expect(res.status).toBe(204);
    expect((await alice.get(`/api/transactions/${body.data.id}`)).status).toBe(404);
  });

  it("returns 404 for another user's transaction and does not delete it", async () => {
    const { body } = await create(alice, groceryBody());
    const res = await bob.delete(`/api/transactions/${body.data.id}`);
    expect(res.status).toBe(404);
    expect((await alice.get(`/api/transactions/${body.data.id}`)).status).toBe(200);
  });
});

describe("GET /api/transactions", () => {
  beforeEach(async () => {
    const rows = [
      {
        type: "INCOME",
        amount: "85000",
        date: "2026-09-01",
        categoryId: salary,
        description: "September salary",
      },
      {
        type: "EXPENSE",
        amount: "20000",
        date: "2026-09-03",
        categoryId: rent,
        description: "Rent",
      },
      {
        type: "EXPENSE",
        amount: "1250.50",
        date: "2026-09-20",
        categoryId: groceries,
        description: "Weekly GROCERIES",
      },
      {
        type: "EXPENSE",
        amount: "800",
        date: "2026-08-28",
        categoryId: groceries,
        description: "Farmers market",
      },
      {
        type: "EXPENSE",
        amount: "300",
        date: "2026-10-02",
        categoryId: groceries,
        description: null,
      },
    ];
    for (const row of rows) await create(alice, row).expect(201);
    await create(bob, groceryBody()).expect(201);
  });

  const dates = (res: request.Response) => res.body.data.map((t: { date: string }) => t.date);

  it("lists only the user's own transactions, newest first", async () => {
    const res = await alice.get("/api/transactions");
    expect(res.status).toBe(200);
    expect(dates(res)).toEqual([
      "2026-10-02",
      "2026-09-20",
      "2026-09-03",
      "2026-09-01",
      "2026-08-28",
    ]);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 5, totalPages: 1 });
  });

  it("filters by type", async () => {
    const res = await alice.get("/api/transactions?type=INCOME");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].description).toBe("September salary");
  });

  it("filters by category", async () => {
    const res = await alice.get(`/api/transactions?categoryId=${groceries}`);
    expect(res.body.meta.total).toBe(3);
  });

  it("filters by an inclusive date range", async () => {
    const res = await alice.get("/api/transactions?startDate=2026-09-01&endDate=2026-09-20");
    expect(dates(res)).toEqual(["2026-09-20", "2026-09-03", "2026-09-01"]);
  });

  it("filters by start date only and end date only", async () => {
    expect(dates(await alice.get("/api/transactions?startDate=2026-09-20"))).toEqual([
      "2026-10-02",
      "2026-09-20",
    ]);
    expect(dates(await alice.get("/api/transactions?endDate=2026-08-31"))).toEqual(["2026-08-28"]);
  });

  it("searches descriptions case-insensitively", async () => {
    const res = await alice.get("/api/transactions?search=groceries");
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].description).toBe("Weekly GROCERIES");
  });

  it("combines filters", async () => {
    const res = await alice.get(
      `/api/transactions?type=EXPENSE&categoryId=${groceries}&startDate=2026-09-01&endDate=2026-09-30`,
    );
    expect(dates(res)).toEqual(["2026-09-20"]);
  });

  it("ignores empty query values", async () => {
    const res = await alice.get("/api/transactions?type=&search=&categoryId=");
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(5);
  });

  it("sorts by amount ascending", async () => {
    const res = await alice.get("/api/transactions?sortBy=amount&sortOrder=asc");
    expect(res.body.data.map((t: { amount: string }) => t.amount)).toEqual([
      "300.00",
      "800.00",
      "1250.50",
      "20000.00",
      "85000.00",
    ]);
  });

  it("paginates", async () => {
    const page1 = await alice.get("/api/transactions?limit=2&page=1");
    const page3 = await alice.get("/api/transactions?limit=2&page=3");
    const page4 = await alice.get("/api/transactions?limit=2&page=4");
    expect(page1.body.meta).toEqual({ page: 1, limit: 2, total: 5, totalPages: 3 });
    expect(dates(page1)).toEqual(["2026-10-02", "2026-09-20"]);
    expect(dates(page3)).toEqual(["2026-08-28"]);
    expect(page4.body.data).toEqual([]);
  });

  it.each([
    "endDate=2026-09-01&startDate=2026-09-30",
    "limit=101",
    "page=0",
    "sortBy=description",
    "startDate=not-a-date",
    `search=${"x".repeat(101)}`,
  ])("rejects invalid query %s", async (query) => {
    const res = await alice.get(`/api/transactions?${query}`);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
