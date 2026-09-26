import { prisma } from "../src/lib/prisma.js";
import { seedCategories } from "../prisma/categories.js";

/** Empties all tables and re-seeds the predefined categories. */
export async function resetDatabase() {
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await seedCategories(prisma);
}
