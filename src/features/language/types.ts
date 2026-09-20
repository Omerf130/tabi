import type { AppLocale } from "@/features/i18n/locale";

export const PHRASEBOOK_CATEGORIES = [
  "basics",
  "restaurants",
  "transport",
  "hotel",
  "shopping",
  "directions",
  "emergency",
  "numbers_time",
] as const;

export type PhrasebookCategory = (typeof PHRASEBOOK_CATEGORIES)[number];

/** Legacy pack row — retained for he-ja compatibility consumers only. */
export type PhrasebookPhrase = {
  id: string;
  packId: string;
  sourceLanguage: "he";
  targetLanguage: "ja";
  category: PhrasebookCategory;
  sourceText: string;
  targetText: string;
  pronunciationLatin?: string;
  pronunciationSource?: string;
  searchKeywords?: string[];
};

/** Legacy pack — retained for he-ja compatibility consumers only. */
export type PhrasebookPack = {
  id: string;
  sourceLanguage: "he";
  targetLanguage: "ja";
  label: string;
  phrases: readonly PhrasebookPhrase[];
};

export type PhrasebookRuntimeState =
  | "ready"
  | "unknown_travel_language"
  | "translation_unavailable";

export type PhraseListItemViewModel = {
  id: string;
  sourceText: string;
  targetTextPreview: string;
  targetLanguage: string | null;
  targetLanguageDirection: "ltr" | "rtl";
  targetAvailable: boolean;
  category: PhrasebookCategory;
  categoryLabel: string;
  isFavorite: boolean;
  detailHref: string;
  searchBlob: string;
};

export type PhraseDetailViewModel = {
  id: string;
  sourceText: string;
  targetText: string;
  targetLanguage: string | null;
  targetLanguageDirection: "ltr" | "rtl";
  targetAvailable: boolean;
  transliterationLatin?: string | null;
  categoryLabel: string;
  isFavorite: boolean;
};

export type LanguagePageViewModel = {
  tripId: string;
  runtimeState: PhrasebookRuntimeState;
  sourceLocale: AppLocale;
  targetLanguage: string | null;
  targetLanguageDirection: "ltr" | "rtl";
  phrases: PhraseListItemViewModel[];
  favoritePhraseIds: string[];
  categoryLabels: Record<PhrasebookCategory, string>;
  tripDetailsHref: string;
  travelLanguageSettingsHref: string;
  translationWarning: boolean;
  customTranslationEnabled: boolean;
};
