import { Router } from "express";
import { authRateLimiter } from "../../middleware/rateLimit.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import * as authController from "./auth.controller.js";

/** Only login and register are rate-limited; /me runs on every page load. */
export function createAuthRouter(rateLimit: number) {
  const router = Router();
  const limiter = authRateLimiter(rateLimit);

  router.post("/register", limiter, authController.register);
  router.post("/login", limiter, authController.login);
  router.post("/logout", authController.logout);
  router.get("/me", requireAuth, authController.me);

  return router;
}
