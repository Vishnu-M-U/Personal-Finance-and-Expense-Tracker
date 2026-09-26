import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";

const BCRYPT_COST = 12;
// Compared against when the email is unknown, so login takes the same time either way.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_COST);

function isUniqueViolation(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && err.code === "P2002";
}

export async function register(input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  try {
    return await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new AppError(409, "EMAIL_TAKEN", "An account with this email already exists");
    }
    throw err;
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordMatches = await bcrypt.compare(input.password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }
  return user;
}

export async function getUserById(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    // Token is valid but the user no longer exists.
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  return user;
}
