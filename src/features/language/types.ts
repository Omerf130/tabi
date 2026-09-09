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

export type PhrasebookPack = {
  id: string;
  sourceLanguage: "he";
  targetLanguage: "ja";
  label: string;
  phrases: readonly PhrasebookPhrase[];
};

export type PhraseListItemViewModel = {
  id: string;
  sourceText: string;
  targetTextPreview: string;
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
  pronunciationLatin?: string;
  pronunciationSource?: string;
  categoryLabel: string;
  isFavorite: boolean;
};

export type LanguagePageViewModel = {
  tripId: string;
  packId: string;
  targetLanguage: string;
  phrases: PhraseListItemViewModel[];
  favoritePhraseIds: string[];
  categoryLabels: Record<PhrasebookCategory, string>;
};
