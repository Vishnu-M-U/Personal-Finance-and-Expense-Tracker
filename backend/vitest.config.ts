import { defineConfig } from "vitest/config";
import { testEnv } from "./tests/testEnv.js";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/globalSetup.ts"],
    // Test files share one database, so run them one at a time.
    fileParallelism: false,
    env: testEnv,
  },
});
