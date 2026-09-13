"use server";

import { redirect } from "next/navigation";
import { connectDb } from "@/lib/db/connect";
import { User } from "@/models/User";
import {
  AUTH_MESSAGES,
  duplicateEmailMessage,
  isDuplicateKeyError,
  type AuthErrorCode,
} from "./errors";
import { resolveAppLocale } from "@/features/i18n/locale";
import { hashPassword, verifyPasswordForLogin } from "./password";
import { registrationUserFields } from "./public-user";
import { sanitizeReturnTo } from "./return-to";
import { loginSchema, registerSchema } from "./schemas";
import { createSession, deleteCurrentSession } from "./session";

export type AuthFieldErrorCodes = {
  name?: AuthErrorCode;
  email?: AuthErrorCode;
  password?: AuthErrorCode;
};

export type AuthActionState = {
  errorCode?: AuthErrorCode;
  fieldErrorCodes?: AuthFieldErrorCodes;
};

function fieldErrorCode(field: string): AuthErrorCode {
  if (field === "name") return AUTH_MESSAGES.name;
  if (field === "email") return AUTH_MESSAGES.email;
  if (field === "password") return AUTH_MESSAGES.password;
  return AUTH_MESSAGES.generic;
}

function zodFieldErrorCodes(error: {
  issues: readonly { path: readonly PropertyKey[]; message: string }[];
}): AuthFieldErrorCodes {
  const fieldErrorCodes: AuthFieldErrorCodes = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "name" || key === "email" || key === "password") {
      fieldErrorCodes[key] = fieldErrorCode(key);
    }
  }
  return fieldErrorCodes;
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
    return { fieldErrorCodes: zodFieldErrorCodes(parsed.error) };
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
    await createSession(user._id.toString(), resolveAppLocale(user.locale));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { errorCode: duplicateEmailMessage() };
    }
    return { errorCode: AUTH_MESSAGES.generic };
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
    return { fieldErrorCodes: zodFieldErrorCodes(parsed.error) };
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
      return { errorCode: AUTH_MESSAGES.invalidCredentials };
    }
    await createSession(user._id.toString(), resolveAppLocale(user.locale));
  } catch {
    return { errorCode: AUTH_MESSAGES.generic };
  }

  const next = sanitizeReturnTo(formData.get("next"));
  redirect(next ?? "/app");
}

export async function logoutAction(): Promise<void> {
  await deleteCurrentSession();
  redirect("/login");
}
