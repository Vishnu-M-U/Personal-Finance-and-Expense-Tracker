import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma.js";
import { CATEGORIES, seedCategories } from "../prisma/categories.js";
import { resetDatabase } from "./helpers.js";

beforeAll(resetDatabase);
afterAll(() => prisma.$disconnect());

describe("database", () => {
  it("seeds 6 income and 12 expense categories", async () => {
    const counts = await prisma.category.groupBy({ by: ["type"], _count: true });
    expect(Object.fromEntries(counts.map((c) => [c.type, c._count]))).toEqual({
      INCOME: 6,
      EXPENSE: 12,
    });
  });

  it("seeding twice does not create duplicates", async () => {
    await seedCategories(prisma);
    expect(await prisma.category.count()).toBe(CATEGORIES.length);
  });

  it("stores amounts as exact decimals and dates without time", async () => {
    const category = await prisma.category.findFirstOrThrow({ where: { type: "EXPENSE" } });
    const user = await prisma.user.create({
      data: { name: "Test", email: "db-test@example.com", passwordHash: "x" },
    });
    const txn = await prisma.transaction.create({
      data: {
        userId: user.id,
        categoryId: category.id,
        type: "EXPENSE",
        amount: "0.10",
        date: new Date("2026-09-26T00:00:00.000Z"),
      },
    });

    const total = await prisma.transaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });
    await prisma.transaction.create({
      data: { ...txn, id: undefined, amount: "0.20", createdAt: undefined, updatedAt: undefined },
    });
    const total2 = await prisma.transaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    });

    expect(total._sum.amount?.toFixed(2)).toBe("0.10");
    expect(total2._sum.amount?.toFixed(2)).toBe("0.30");
    expect(txn.date.toISOString()).toBe("2026-09-26T00:00:00.000Z");
  });

  it("deleting a user deletes their transactions", async () => {
    await prisma.user.delete({ where: { email: "db-test@example.com" } });
    expect(await prisma.transaction.count()).toBe(0);
  });
});
