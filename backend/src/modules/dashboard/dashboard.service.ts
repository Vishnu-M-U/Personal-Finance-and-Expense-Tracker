import { Prisma, type TransactionType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { currentMonthRange, toDbDate } from "../../utils/dates.js";
import type { SummaryQuery } from "./dashboard.schemas.js";

const RECENT_LIMIT = 5;
const ZERO = new Prisma.Decimal(0);

interface CategoryTotal {
  categoryId: number;
  name: string;
  total: Prisma.Decimal;
}

function withPercentages(rows: CategoryTotal[], typeTotal: Prisma.Decimal) {
  return rows
    .sort((a, b) => b.total.comparedTo(a.total))
    .map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      total: row.total.toFixed(2),
      percentage: typeTotal.isZero()
        ? 0
        : row.total.div(typeTotal).mul(100).toDecimalPlaces(2).toNumber(),
    }));
}

export async function getSummary(userId: number, query: SummaryQuery) {
  const defaults = currentMonthRange();
  const startDate = query.startDate ?? defaults.startDate;
  const endDate = query.endDate ?? defaults.endDate;

  const where: Prisma.TransactionWhereInput = {
    userId,
    date: { gte: toDbDate(startDate), lte: toDbDate(endDate) },
  };

  const [byCategory, recentTransactions] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type", "categoryId"],
      where,
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: RECENT_LIMIT,
    }),
  ]);

  const categories = await prisma.category.findMany({
    where: { id: { in: byCategory.map((row) => row.categoryId) } },
  });
  const categoryNames = new Map(categories.map((c) => [c.id, c.name]));

  const totals: Record<TransactionType, Prisma.Decimal> = { INCOME: ZERO, EXPENSE: ZERO };
  const rowsByType: Record<TransactionType, CategoryTotal[]> = { INCOME: [], EXPENSE: [] };

  for (const row of byCategory) {
    const total = row._sum.amount ?? ZERO;
    totals[row.type] = totals[row.type].plus(total);
    rowsByType[row.type].push({
      categoryId: row.categoryId,
      name: categoryNames.get(row.categoryId) ?? "Unknown",
      total,
    });
  }

  return {
    period: { startDate, endDate },
    totals: {
      income: totals.INCOME.toFixed(2),
      expense: totals.EXPENSE.toFixed(2),
      balance: totals.INCOME.minus(totals.EXPENSE).toFixed(2),
    },
    expenseByCategory: withPercentages(rowsByType.EXPENSE, totals.EXPENSE),
    incomeByCategory: withPercentages(rowsByType.INCOME, totals.INCOME),
    recentTransactions,
  };
}
