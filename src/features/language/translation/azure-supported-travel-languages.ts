import type { AppLocale } from "@/features/i18n/locale";
import { normalizeTravelLanguageCode } from "@/features/trips/destination/normalize-travel-language-code";
import { resolveLanguageTextDirection } from "../resolve-language-text-direction";

/**
 * Deterministic Azure Translator target languages supported by Tabi travel/custom translation.
 * Update intentionally when Azure coverage changes — not fetched at runtime.
 */
export const AZURE_SUPPORTED_TRAVEL_LANGUAGE_CODES = [
  "af",
  "ar",
  "bg",
  "bn",
  "bs",
  "ca",
  "cs",
  "cy",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "fa",
  "fi",
  "fil",
  "fr",
  "gu",
  "he",
  "hi",
  "hr",
  "hu",
  "id",
  "is",
  "it",
  "ja",
  "ka",
  "kk",
  "km",
  "kn",
  "ko",
  "lt",
  "lv",
  "mk",
  "ml",
  "mr",
  "ms",
  "mt",
  "my",
  "nb",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sq",
  "sr-Cyrl",
  "sr-Latn",
  "sv",
  "sw",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "vi",
  "zh-Hans",
  "zh-Hant",
] as const;

export type AzureSupportedTravelLanguageCode =
  (typeof AZURE_SUPPORTED_TRAVEL_LANGUAGE_CODES)[number];

const supportedLookup = new Map<string, AzureSupportedTravelLanguageCode>(
  AZURE_SUPPORTED_TRAVEL_LANGUAGE_CODES.map((code) => [code.toLowerCase(), code]),
);

export type TravelLanguageOption = {
  code: AzureSupportedTravelLanguageCode;
  label: string;
  textDirection: "ltr" | "rtl";
  azureTranslationSupported: true;
};

function canonicalSupportedCode(
  normalized: string,
): AzureSupportedTravelLanguageCode | null {
  const direct = supportedLookup.get(normalized.toLowerCase());
  if (direct) {
    return direct;
  }

  const primary = normalized.split("-")[0]?.toLowerCase();
  if (!primary) {
    return null;
  }

  return supportedLookup.get(primary) ?? null;
}

export function isAzureSupportedTravelLanguageCode(
  code: string | null | undefined,
): boolean {
  const normalized = normalizeTravelLanguageCode(code);
  if (!normalized) {
    return false;
  }
  return canonicalSupportedCode(normalized) !== null;
}

export function normalizeSelectableTravelLanguageCode(
  code: string | null | undefined,
): AzureSupportedTravelLanguageCode | null {
  const normalized = normalizeTravelLanguageCode(code);
  if (!normalized) {
    return null;
  }
  return canonicalSupportedCode(normalized);
}

export function getTravelLanguageDisplayName(
  code: string,
  locale: AppLocale,
): string {
  const intlLocale = locale === "he" ? "he" : "en";
  const display = new Intl.DisplayNames([intlLocale], { type: "language" });

  try {
    const label = display.of(code);
    if (label) {
      return label;
    }
  } catch {
    // fall through
  }

  const primary = code.split("-")[0];
  try {
    return display.of(primary) ?? code;
  } catch {
    return code;
  }
}

export function toTravelLanguageOption(
  code: AzureSupportedTravelLanguageCode,
  locale: AppLocale,
): TravelLanguageOption {
  return {
    code,
    label: getTravelLanguageDisplayName(code, locale),
    textDirection: resolveLanguageTextDirection(code),
    azureTranslationSupported: true,
  };
}

export function listSupportedTravelLanguageOptions(
  locale: AppLocale,
): TravelLanguageOption[] {
  return AZURE_SUPPORTED_TRAVEL_LANGUAGE_CODES.map((code) =>
    toTravelLanguageOption(code, locale),
  ).sort((left, right) => left.label.localeCompare(right.label, locale));
}
