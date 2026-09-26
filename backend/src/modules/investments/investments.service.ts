import { Prisma, type Investment, type InvestmentType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { percentage } from "./investments.math.js";
import type { CreateInvestmentInput, UpdateInvestmentInput } from "./investments.schemas.js";

const ZERO = new Prisma.Decimal(0);

function notFound() {
  return new AppError(404, "NOT_FOUND", "Investment not found");
}

/** Portfolio totals and allocation by type (share of current value), largest first. */
function summarize(investments: Investment[]) {
  const totalInvested = investments.reduce((sum, i) => sum.plus(i.investedAmount), ZERO);
  const currentValue = investments.reduce((sum, i) => sum.plus(i.currentValue), ZERO);
  const totalReturn = currentValue.minus(totalInvested);

  const byType = new Map<InvestmentType, Prisma.Decimal>();
  for (const i of investments) {
    byType.set(i.type, (byType.get(i.type) ?? ZERO).plus(i.currentValue));
  }
  const allocation = [...byType.entries()]
    .sort(([, a], [, b]) => b.comparedTo(a))
    .map(([type, value]) => ({
      type,
      currentValue: value.toFixed(2),
      percentage: percentage(value, currentValue),
    }));

  return {
    totalInvested: totalInvested.toFixed(2),
    currentValue: currentValue.toFixed(2),
    totalReturn: totalReturn.toFixed(2),
    returnPercentage: percentage(totalReturn, totalInvested),
    allocation,
  };
}

/** All of the user's investments (newest first) with portfolio totals. */
export async function listInvestments(userId: number) {
  const investments = await prisma.investment.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  return { investments, summary: summarize(investments) };
}

export async function getInvestment(userId: number, id: number) {
  const investment = await prisma.investment.findFirst({ where: { id, userId } });
  if (!investment) throw notFound();
  return investment;
}

export function createInvestment(userId: number, input: CreateInvestmentInput) {
  return prisma.investment.create({ data: { userId, ...input } });
}

export async function updateInvestment(userId: number, id: number, input: UpdateInvestmentInput) {
  const existing = await getInvestment(userId, id);
  return prisma.investment.update({ where: { id: existing.id }, data: input });
}

export async function deleteInvestment(userId: number, id: number) {
  const { count } = await prisma.investment.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}
