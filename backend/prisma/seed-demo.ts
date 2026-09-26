/**
 * Creates a demo user with ~3 months of sample transactions ending today, plus a few investments.
 * Re-running resets the demo user's transactions and investments. Development only.
 *
 *   npm run db:seed:demo   →   demo@example.com / password123
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, type InvestmentType } from "../src/generated/prisma/client.js";
import { seedCategories } from "./categories.js";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "password123";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
if (process.env.NODE_ENV === "production")
  throw new Error("Refusing to seed demo data in production");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(url) });

/** UTC-midnight date for a day in the month `monthsAgo` months before now (clamped to today). */
function day(monthsAgo: number, dayOfMonth: number): Date {
  const now = new Date();
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth));
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  return date > today ? today : date;
}

// [category, amount, day of month, description]
const MONTHLY: [string, string, number, string | null][] = [
  ["Salary", "85000.00", 1, "Monthly salary"],
  ["Rent & Housing", "22000.00", 2, "Rent"],
  ["Utilities", "2350.00", 6, "Electricity & water"],
  ["Bills & Subscriptions", "649.00", 8, "Streaming"],
  ["Bills & Subscriptions", "799.00", 10, "Mobile & internet"],
  ["Groceries", "3180.40", 4, "Weekly groceries"],
  ["Groceries", "2765.90", 11, "Weekly groceries"],
  ["Groceries", "3420.15", 18, "Weekly groceries"],
  ["Groceries", "2990.00", 25, "Weekly groceries"],
  ["Transportation", "1500.00", 3, "Metro pass"],
  ["Food & Dining", "1840.00", 13, "Dinner with friends"],
  ["Food & Dining", "620.00", 21, null],
  ["Entertainment", "900.00", 15, "Movie night"],
];

const ONE_OFF: [number, string, string, number, string | null][] = [
  // [months ago, category, amount, day, description]
  [0, "Freelance", "18000.00", 12, "Website project"],
  [0, "Shopping", "4599.00", 9, "Running shoes"],
  [0, "Healthcare", "1200.00", 16, "Doctor visit"],
  [1, "Travel", "24500.00", 20, "Weekend trip to Goa"],
  [1, "Investments", "3200.00", 28, "Dividend"],
  [1, "Education", "3999.00", 5, "Online course"],
  [2, "Gifts", "5000.00", 14, "Birthday gift received"],
  [2, "Shopping", "2199.00", 22, "Headphones"],
  [2, "Healthcare", "850.00", 9, "Pharmacy"],
];

// [name, type, invested, current value]
const INVESTMENTS: [string, InvestmentType, string, string][] = [
  ["Nippon Small Cap", "MUTUAL_FUND", "50000.00", "58000.00"],
  ["Parag Parikh Flexicap", "MUTUAL_FUND", "60000.00", "69000.00"],
  ["Gold ETF", "GOLD", "40000.00", "45500.00"],
  ["Infosys", "STOCKS", "25000.00", "23150.00"],
];

try {
  await seedCategories(prisma);
  const categories = new Map((await prisma.category.findMany()).map((c) => [c.name, c] as const));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { passwordHash },
    create: { name: "Demo User", email: DEMO_EMAIL, passwordHash },
  });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  const rows = [
    ...[0, 1, 2].flatMap((monthsAgo) =>
      MONTHLY.map(([name, amount, dom, description]) => ({
        monthsAgo,
        name,
        amount,
        dom,
        description,
      })),
    ),
    ...ONE_OFF.map(([monthsAgo, name, amount, dom, description]) => ({
      monthsAgo,
      name,
      amount,
      dom,
      description,
    })),
  ];

  await prisma.transaction.createMany({
    data: rows.map(({ monthsAgo, name, amount, dom, description }) => {
      const category = categories.get(name);
      if (!category) throw new Error(`Unknown category: ${name}`);
      return {
        userId: user.id,
        categoryId: category.id,
        type: category.type,
        amount,
        date: day(monthsAgo, dom),
        description,
      };
    }),
  });

  await prisma.investment.deleteMany({ where: { userId: user.id } });
  await prisma.investment.createMany({
    data: INVESTMENTS.map(([name, type, investedAmount, currentValue]) => ({
      userId: user.id,
      name,
      type,
      investedAmount,
      currentValue,
    })),
  });

  console.log(
    `Demo user ready: ${DEMO_EMAIL} / ${DEMO_PASSWORD} ` +
      `(${rows.length} transactions, ${INVESTMENTS.length} investments)`,
  );
} finally {
  await prisma.$disconnect();
}
