import request from "supertest";
import type { App } from "supertest/types.js";
import { prisma } from "../src/lib/prisma.js";
import { seedCategories } from "../prisma/categories.js";

/** Empties all tables and re-seeds the predefined categories. */
export async function resetDatabase() {
  await prisma.transaction.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await seedCategories(prisma);
}

let userCounter = 0;

/** Registers a new user and returns an agent that sends their auth cookie. */
export async function registerUser(app: App, overrides: { email?: string } = {}) {
  userCounter += 1;
  const credentials = {
    name: `User ${userCounter}`,
    email: overrides.email ?? `user${userCounter}-${Date.now()}@example.com`,
    password: "password123",
  };
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send(credentials).expect(201);
  return { agent, user: res.body.data.user as { id: number; email: string }, credentials };
}

/** Looks up a seeded category id by name. */
export async function categoryId(name: string) {
  const category = await prisma.category.findFirstOrThrow({ where: { name } });
  return category.id;
}
