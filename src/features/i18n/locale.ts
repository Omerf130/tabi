export type AppLocale = "he" | "en";

export const APP_LOCALES: AppLocale[] = ["he", "en"];

export const DEFAULT_APP_LOCALE: AppLocale = "he";

export function parseAppLocale(value: unknown): AppLocale | null {
  if (value === "he" || value === "en") {
    return value;
  }
  return null;
}

export function resolveAppLocale(value: unknown): AppLocale {
  return parseAppLocale(value) ?? DEFAULT_APP_LOCALE;
}

export function localeToHtmlLang(locale: AppLocale): AppLocale {
  return locale;
}

export function localeToDirection(locale: AppLocale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

export function localeToIntlLocale(locale: AppLocale): "he-IL" | "en-US" {
  return locale === "he" ? "he-IL" : "en-US";
}
