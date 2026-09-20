import { normalizeTravelLanguageCode } from "@/features/trips/destination/normalize-travel-language-code";

/** Normalizes trip travel language codes for Azure Translator `to` parameters. */
export function toAzureTranslatorTargetLanguage(
  targetTravelLanguageCode: string,
): string | null {
  return normalizeTravelLanguageCode(targetTravelLanguageCode);
}

export function isEnglishTargetLanguage(targetLanguage: string): boolean {
  const normalized = normalizeTravelLanguageCode(targetLanguage);
  if (!normalized) {
    return false;
  }
  return normalized.split("-")[0] === "en";
}
