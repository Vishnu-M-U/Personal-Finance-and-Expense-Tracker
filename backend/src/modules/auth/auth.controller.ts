import type { Request, Response } from "express";
import { getUserId } from "../../middleware/requireAuth.js";
import { clearAuthCookie, setAuthCookie } from "../../utils/authCookie.js";
import { signAccessToken } from "../../utils/jwt.js";
import { serializeUser } from "../../utils/serializers.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";
import * as authService from "./auth.service.js";

function startSession(res: Response, userId: number) {
  const { token, expiresAt } = signAccessToken(userId);
  setAuthCookie(res, token, expiresAt);
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const user = await authService.register(input);
  startSession(res, user.id);
  res.status(201).json({ data: { user: serializeUser(user) } });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await authService.login(input);
  startSession(res, user.id);
  res.json({ data: { user: serializeUser(user) } });
}

export function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  res.status(204).end();
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(getUserId(req));
  res.json({ data: { user: serializeUser(user) } });
}
