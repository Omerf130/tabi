import { resolveAppLocale, type AppLocale } from "@/features/i18n/locale";

export type PlatformRole = "user" | "admin";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  locale: AppLocale;
  /** Explicit user-chosen reference currency; never inferred. */
  homeCurrency: string | null;
};

export function toPublicUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: PlatformRole;
  locale?: AppLocale | null;
  homeCurrency?: string | null;
  passwordHash?: string | null;
  googleSubject?: string | null;
}): PublicUser {
  const homeCurrency = user.homeCurrency?.trim().toUpperCase();
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    locale: resolveAppLocale(user.locale),
    homeCurrency: homeCurrency && homeCurrency.length === 3 ? homeCurrency : null,
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
