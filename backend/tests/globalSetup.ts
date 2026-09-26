import { execSync } from "node:child_process";
import { testEnv } from "./testEnv.js";

/** Creates the test database if needed and applies all migrations to it. */
export default function setup() {
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testEnv.DATABASE_URL },
    stdio: "pipe",
  });
}
