import type { Category, Transaction, User } from "../generated/prisma/client.js";
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
