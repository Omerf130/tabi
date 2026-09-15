import type { CurrencyOption } from "@/features/currency/types";
import type { AppLocale } from "@/features/i18n/locale";

export function formatCurrencySettingsLabel(
  option: CurrencyOption | undefined,
  code: string,
  locale: AppLocale,
): string {
  if (!option) {
    return code;
  }
  const name = locale === "he" ? option.hebrewName : option.englishName;
  return `${name} · ${option.code}`;
}

export function formatCurrencySettingsSecondary(
  option: CurrencyOption | undefined,
  code: string,
): string {
  if (!option) {
    return code;
  }
  const symbol = option.symbol.trim();
  if (symbol && symbol !== code) {
    return `${code} · ${symbol}`;
  }
  return code;
}
