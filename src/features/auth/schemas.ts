import { z } from "zod";
import {
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "./constants";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

export const registerSchema = z
  .object({
    name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
