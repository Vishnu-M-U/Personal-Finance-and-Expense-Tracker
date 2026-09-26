import type { Prisma, TransactionType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { toDbDate } from "../../utils/dates.js";
import type {
  CreateTransactionInput,
  ListTransactionsQuery,
  UpdateTransactionInput,
} from "./transactions.schemas.js";

const include = { category: true } as const;

function notFound() {
  return new AppError(404, "NOT_FOUND", "Transaction not found");
}

function categoryError(message: string) {
  return new AppError(400, "VALIDATION_ERROR", "Invalid request data", [
    { field: "categoryId", message },
  ]);
}

async function assertCategoryMatches(categoryId: number, type: TransactionType) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw categoryError("Category not found");
  if (category.type !== type) throw categoryError("Category does not match transaction type");
}

export async function listTransactions(userId: number, query: ListTransactionsQuery) {
  const where: Prisma.TransactionWhereInput = {
    userId,
    type: query.type,
    categoryId: query.categoryId,
    description: query.search ? { contains: query.search } : undefined,
    date:
      query.startDate || query.endDate
        ? {
            gte: query.startDate ? toDbDate(query.startDate) : undefined,
            lte: query.endDate ? toDbDate(query.endDate) : undefined,
          }
        : undefined,
  };

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include,
      orderBy: [{ [query.sortBy]: query.sortOrder }, { id: "desc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getTransaction(userId: number, id: number) {
  const transaction = await prisma.transaction.findFirst({ where: { id, userId }, include });
  if (!transaction) throw notFound();
  return transaction;
}

export async function createTransaction(userId: number, input: CreateTransactionInput) {
  await assertCategoryMatches(input.categoryId, input.type);
  return prisma.transaction.create({
    data: {
      userId,
      type: input.type,
      amount: input.amount,
      date: toDbDate(input.date),
      categoryId: input.categoryId,
      description: input.description,
    },
    include,
  });
}

export async function updateTransaction(userId: number, id: number, input: UpdateTransactionInput) {
  const existing = await getTransaction(userId, id);

  if (input.type !== undefined || input.categoryId !== undefined) {
    await assertCategoryMatches(
      input.categoryId ?? existing.categoryId,
      input.type ?? existing.type,
    );
  }

  return prisma.transaction.update({
    where: { id: existing.id },
    data: {
      type: input.type,
      amount: input.amount,
      date: input.date ? toDbDate(input.date) : undefined,
      categoryId: input.categoryId,
      description: input.description,
    },
    include,
  });
}

export async function deleteTransaction(userId: number, id: number) {
  const { count } = await prisma.transaction.deleteMany({ where: { id, userId } });
  if (count === 0) throw notFound();
}
