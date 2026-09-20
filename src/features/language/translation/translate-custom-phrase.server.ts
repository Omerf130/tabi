import "server-only";

import type { AppLocale } from "@/features/i18n/locale";
import { parseAppLocale } from "@/features/i18n/locale";
import { normalizeSelectableTravelLanguageCode } from "./azure-supported-travel-languages";
import { translateTexts, transliterateTexts } from "./azure-translator.server";
import { AzureTranslatorRequestError } from "./azure-translator-errors";
import { resolveAzureTransliterationSpec } from "./azure-transliteration-capability";

export const CUSTOM_TRANSLATION_MAX_LENGTH = 500;

export class CustomTranslationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomTranslationValidationError";
  }
}

export class CustomTranslationUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CustomTranslationUnavailableError";
  }
}

export type CustomTranslationResult = {
  translatedText: string;
  transliterationLatin: string | null;
  sourceLanguage: "he" | "en";
  targetLanguage: string;
};

function resolveCustomTranslationSourceLanguage(
  uiLocale: AppLocale,
): "he" | "en" {
  const parsed = parseAppLocale(uiLocale);
  return parsed === "en" ? "en" : "he";
}

export async function translateCustomPhrase(input: {
  text: string;
  uiLocale: AppLocale;
  targetTravelLanguageCode: string;
}): Promise<CustomTranslationResult> {
  const trimmed = input.text.trim();
  if (!trimmed) {
    throw new CustomTranslationValidationError("empty");
  }
  if (trimmed.length > CUSTOM_TRANSLATION_MAX_LENGTH) {
    throw new CustomTranslationValidationError("too_long");
  }

  const targetLanguage = normalizeSelectableTravelLanguageCode(
    input.targetTravelLanguageCode,
  );
  if (!targetLanguage) {
    throw new CustomTranslationUnavailableError("unknown_target");
  }

  const sourceLanguage = resolveCustomTranslationSourceLanguage(input.uiLocale);

  if (sourceLanguage === "en" && targetLanguage === "en") {
    return {
      translatedText: trimmed,
      transliterationLatin: null,
      sourceLanguage,
      targetLanguage,
    };
  }

  try {
    const translated = await translateTexts({
      texts: [trimmed],
      from: sourceLanguage,
      to: targetLanguage,
    });

    const translatedText = translated.translations[0];
    if (!translatedText) {
      throw new CustomTranslationUnavailableError("provider");
    }

    let transliterationLatin: string | null = null;
    const spec = resolveAzureTransliterationSpec(targetLanguage);
    if (spec) {
      try {
        const transliteration = await transliterateTexts({
          texts: [translatedText],
          language: spec.language,
          fromScript: spec.fromScript,
          toScript: spec.toScript,
        });
        transliterationLatin = transliteration.transliterations[0] ?? null;
      } catch {
        transliterationLatin = null;
      }
    }

    return {
      translatedText,
      transliterationLatin,
      sourceLanguage,
      targetLanguage,
    };
  } catch (error) {
    if (error instanceof CustomTranslationValidationError) {
      throw error;
    }
    if (error instanceof AzureTranslatorRequestError) {
      throw new CustomTranslationUnavailableError("provider");
    }
    throw new CustomTranslationUnavailableError("provider");
  }
}
