import type { Category, Investment, Transaction, User } from "../generated/prisma/client.js";
import { investmentReturn } from "../modules/investments/investments.math.js";
import { fromDbDate } from "./dates.js";

export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeCategory(category: Category) {
  return { id: category.id, name: category.name, type: category.type };
}

export function serializeTransaction(transaction: Transaction & { category: Category }) {
  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount.toFixed(2),
    date: fromDbDate(transaction.date),
    description: transaction.description,
    category: serializeCategory(transaction.category),
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

export function serializeInvestment(investment: Investment) {
  const { returnAmount, returnPercentage } = investmentReturn(investment);
  return {
    id: investment.id,
    name: investment.name,
    type: investment.type,
    investedAmount: investment.investedAmount.toFixed(2),
    currentValue: investment.currentValue.toFixed(2),
    returnAmount: returnAmount.toFixed(2),
    returnPercentage,
    createdAt: investment.createdAt.toISOString(),
    updatedAt: investment.updatedAt.toISOString(),
  };
}
