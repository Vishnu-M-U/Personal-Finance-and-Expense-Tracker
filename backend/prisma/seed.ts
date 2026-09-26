import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { CATEGORIES, seedCategories } from "./categories.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

try {
  await seedCategories(prisma);
  console.log(`Seeded ${CATEGORIES.length} categories.`);
} finally {
  await prisma.$disconnect();
}
