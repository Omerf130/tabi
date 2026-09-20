import type { PhrasebookCategory } from "./types";

/** Destination-neutral built-in travel phrase intent (G8.2+). */
export type PhraseIntent = {
  id: string;
  category: PhrasebookCategory;
  /** Key under the Language next-intl namespace (e.g. phrases.basics.hello). */
  messageKey: string;
  /** Canonical English text for Azure translation (not derived from UI locale). */
  azureSourceText: string;
  /** Destination-neutral search hints (localized UI text added at search time later). */
  searchKeywords?: readonly string[];
};

export const EXPECTED_PHRASE_INTENT_COUNT = 58;
