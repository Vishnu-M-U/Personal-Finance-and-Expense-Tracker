import type { TransactionType } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";

export function listCategories(type?: TransactionType) {
  return prisma.category.findMany({
    where: { type },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });
}
