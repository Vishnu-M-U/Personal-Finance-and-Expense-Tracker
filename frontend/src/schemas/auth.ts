import { z } from "zod";

// Mirrors the backend rules in SPEC/api.md so users see errors before submitting.
const email = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
