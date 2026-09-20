export type CanonicalPhraseTranslationStatus = "available" | "unavailable";

export type CanonicalPhraseTranslation = {
  phraseId: string;
  sourceLanguage: "en";
  targetLanguage: string | null;
  translatedText: string | null;
  transliterationLatin: string | null;
  status: CanonicalPhraseTranslationStatus;
  fromCache: boolean;
  contentVersion: string;
};

export type ResolveCanonicalPhraseTranslationsResult = {
  targetLanguage: string | null;
  translations: readonly CanonicalPhraseTranslation[];
  stats: {
    cacheHits: number;
    cacheMisses: number;
    azureTranslateCalls: number;
    azureTransliterateCalls: number;
  };
};
