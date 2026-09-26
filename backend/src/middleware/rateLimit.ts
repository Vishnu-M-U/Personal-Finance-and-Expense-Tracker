import { rateLimit } from "express-rate-limit";

export function authRateLimiter(limit: number) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    statusCode: 429,
    message: {
      error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" },
    },
  });
}
