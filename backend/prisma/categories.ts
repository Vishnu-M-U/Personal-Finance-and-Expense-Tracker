import type { PrismaClient } from "../src/generated/prisma/client.js";
import { TransactionType } from "../src/generated/prisma/enums.js";

export const CATEGORIES: { name: string; type: TransactionType }[] = [
  ...["Salary", "Freelance", "Business", "Investments", "Gifts", "Other Income"].map((name) => ({
    name,
    type: TransactionType.INCOME,
  })),
  ...[
    "Food & Dining",
    "Groceries",
    "Transportation",
    "Rent & Housing",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Travel",
    "Bills & Subscriptions",
    "Other Expense",
  ].map((name) => ({ name, type: TransactionType.EXPENSE })),
];

/** Inserts the predefined categories. Safe to run repeatedly. */
export async function seedCategories(prisma: PrismaClient) {
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name_type: category },
      update: {},
      create: category,
    });
  }
}
