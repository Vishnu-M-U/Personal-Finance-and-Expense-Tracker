import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { AUTH_COOKIE } from "../utils/authCookie.js";
import { verifyAccessToken } from "../utils/jwt.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.[AUTH_COOKIE];
  const userId = typeof token === "string" ? verifyAccessToken(token) : null;

  if (!userId) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  req.userId = userId;
  next();
}

/** Returns the authenticated user's id. Only call from routes behind requireAuth. */
export function getUserId(req: Request): number {
  if (!req.userId) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  return req.userId;
}
