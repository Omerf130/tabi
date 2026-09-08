"use server";

import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";
import {
  AUTH_MESSAGES,
  duplicateEmailMessage,
  isDuplicateKeyError,
} from "./errors";
import { hashPassword, verifyPasswordForLogin } from "./password";
import { registrationUserFields } from "./public-user";
import { sanitizeReturnTo } from "./return-to";
import { loginSchema, registerSchema } from "./schemas";
import { createSession, deleteCurrentSession } from "./session";

export type AuthFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export type AuthActionState = {
  error?: string;
  fieldErrors?: AuthFieldErrors;
};

function fieldMessage(field: string): string {
  if (field === "name") return AUTH_MESSAGES.name;
  if (field === "email") return AUTH_MESSAGES.email;
  if (field === "password") return AUTH_MESSAGES.password;
  return AUTH_MESSAGES.generic;
}

function zodFieldErrors(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "email" || key === "password") {
      fieldErrors[key] = fieldMessage(key);
    }
  }
  return fieldErrors;
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await connectDb();
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create(
      registrationUserFields({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      }),
    );
    await createSession(user._id.toString());
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { error: duplicateEmailMessage() };
    }
    return { error: AUTH_MESSAGES.generic };
  }

  const next = sanitizeReturnTo(formData.get("next"));
  redirect(next ?? "/app");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await connectDb();
    const user = await User.findOne({ email: parsed.data.email }).select(
      "+passwordHash",
    );
    const ok = await verifyPasswordForLogin(
      user?.passwordHash ?? null,
      parsed.data.password,
    );
    if (!ok || !user) {
      return { error: AUTH_MESSAGES.invalidCredentials };
    }
    await createSession(user._id.toString());
  } catch {
    return { error: AUTH_MESSAGES.generic };
  }

  const next = sanitizeReturnTo(formData.get("next"));
  redirect(next ?? "/app");
}

export async function logoutAction(): Promise<void> {
  await deleteCurrentSession();
  redirect("/login");
}
