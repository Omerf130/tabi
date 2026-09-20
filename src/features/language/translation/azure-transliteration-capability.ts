/**
 * Deterministic Azure transliteration support for travel target languages.
 * Extend this table as we validate additional language/script pairs.
 */
export type AzureTransliterationSpec = {
  language: string;
  fromScript: string;
  toScript: "Latn";
};

const TRANSLITERATION_BY_TARGET_LANGUAGE = new Map<string, AzureTransliterationSpec>([
  ["ja", { language: "ja", fromScript: "Jpan", toScript: "Latn" }],
  ["ko", { language: "ko", fromScript: "Kore", toScript: "Latn" }],
  ["zh-hans", { language: "zh-Hans", fromScript: "Hans", toScript: "Latn" }],
  ["zh-hant", { language: "zh-Hant", fromScript: "Hant", toScript: "Latn" }],
  ["ar", { language: "ar", fromScript: "Arab", toScript: "Latn" }],
  ["he", { language: "he", fromScript: "Hebr", toScript: "Latn" }],
  ["ru", { language: "ru", fromScript: "Cyrl", toScript: "Latn" }],
  ["uk", { language: "uk", fromScript: "Cyrl", toScript: "Latn" }],
  ["el", { language: "el", fromScript: "Grek", toScript: "Latn" }],
  ["th", { language: "th", fromScript: "Thai", toScript: "Latn" }],
]);

function normalizeTargetLookupKey(targetLanguage: string): string {
  return targetLanguage.trim().toLowerCase();
}

export function resolveAzureTransliterationSpec(
  targetLanguage: string,
): AzureTransliterationSpec | null {
  const normalized = normalizeTargetLookupKey(targetLanguage);
  const direct = TRANSLITERATION_BY_TARGET_LANGUAGE.get(normalized);
  if (direct) {
    return direct;
  }

  const primary = normalized.split("-")[0];
  return TRANSLITERATION_BY_TARGET_LANGUAGE.get(primary) ?? null;
}

export function supportsAzureTransliteration(targetLanguage: string): boolean {
  return resolveAzureTransliterationSpec(targetLanguage) !== null;
}
