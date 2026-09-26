import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

interface TokenPayload {
  sub: string;
  exp: number;
}

/** Signs an access token for the user. Returns the token and its expiry time. */
export function signAccessToken(userId: number) {
  const token = jwt.sign({}, env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    algorithm: "HS256",
  });
  const { exp } = jwt.decode(token) as TokenPayload;
  return { token, expiresAt: new Date(exp * 1000) };
}

/** Returns the user id from a valid token, or null if the token is invalid or expired. */
export function verifyAccessToken(token: string): number | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
    const userId = Number(payload.sub);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}
