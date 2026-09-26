import type { Investment, Prisma } from "../../generated/prisma/client.js";

/** Percentage of `part` in `whole`, to 2 decimals; 0 when `whole` is 0. */
export function percentage(part: Prisma.Decimal, whole: Prisma.Decimal) {
  return whole.isZero() ? 0 : part.div(whole).mul(100).toDecimalPlaces(2).toNumber();
}

/** Return on one investment: current value minus invested, and that as a % of invested. */
export function investmentReturn(investment: Investment) {
  const returnAmount = investment.currentValue.minus(investment.investedAmount);
  return { returnAmount, returnPercentage: percentage(returnAmount, investment.investedAmount) };
}
