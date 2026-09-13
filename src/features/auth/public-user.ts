import { resolveAppLocale, type AppLocale } from "@/features/i18n/locale";

export type PlatformRole = "user" | "admin";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  locale: AppLocale;
};

export function toPublicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: PlatformRole;
  locale?: AppLocale | null;
  passwordHash?: string | null;
  googleSubject?: string | null;
}): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    locale: resolveAppLocale(user.locale),
  };
}

export function registrationUserFields(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  return {
    name: input.name,
    email: input.email,
    passwordHash: input.passwordHash,
    role: "user" as const,
  };
}
