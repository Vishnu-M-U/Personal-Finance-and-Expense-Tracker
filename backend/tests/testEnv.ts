/** Environment used by the test run. Shared by vitest.config.ts and globalSetup. */
export const testEnv = {
  NODE_ENV: "test",
  CORS_ORIGIN: "http://localhost:3000",
  JWT_SECRET: "test-secret-that-is-at-least-32-characters-long",
  JWT_EXPIRES_IN: "1d",
  DATABASE_URL:
    process.env.TEST_DATABASE_URL ??
    "mysql://root:rootpassword@localhost:3307/finance_tracker_test",
};
