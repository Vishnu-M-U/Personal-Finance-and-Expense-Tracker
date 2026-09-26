import type { CookieOptions, Response } from "express";
import { isProduction } from "../config/env.js";

export const AUTH_COOKIE = "access_token";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

export function setAuthCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(AUTH_COOKIE, token, { ...baseOptions, maxAge: expiresAt.getTime() - Date.now() });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE, baseOptions);
}
