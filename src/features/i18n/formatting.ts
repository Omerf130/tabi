import {
  localeToIntlLocale,
  type AppLocale,
} from "./locale";

export function formatAppDate(
  value: Date | string | number,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(localeToIntlLocale(locale), options).format(
    date,
  );
}

export function formatAppNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(localeToIntlLocale(locale), options).format(
    value,
  );
}
