export type AzureTranslateTextsInput = {
  texts: readonly string[];
  from: string;
  to: string;
};

export type AzureTranslateTextsResult = {
  translations: readonly string[];
};

export type AzureTransliterateTextsInput = {
  texts: readonly string[];
  language: string;
  fromScript: string;
  toScript: string;
};

export type AzureTransliterateTextsResult = {
  transliterations: readonly (string | null)[];
};

export type AzureTranslatorFetch = typeof fetch;
