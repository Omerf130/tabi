import { DEFAULT_PHRASEBOOK_PACK_ID } from "../constants";
import type { PhrasebookPack, PhrasebookPhrase } from "../types";
import { HE_JA_PHRASES } from "./he-ja";

const HE_JA_PACK: PhrasebookPack = {
  id: DEFAULT_PHRASEBOOK_PACK_ID,
  sourceLanguage: "he",
  targetLanguage: "ja",
  label: "Hebrew → Japanese",
  phrases: HE_JA_PHRASES,
};

const PACKS: Record<string, PhrasebookPack> = {
  [DEFAULT_PHRASEBOOK_PACK_ID]: HE_JA_PACK,
};

export function getPhrasebookPack(packId: string): PhrasebookPack | null {
  return PACKS[packId] ?? null;
}

/** V1 default: Tabi explicitly uses the he-ja pack. No Trip language field yet. */
export function getDefaultPhrasebookPack(): PhrasebookPack {
  return HE_JA_PACK;
}

export function getPhraseFromDefaultPack(phraseId: string): PhrasebookPhrase | null {
  return HE_JA_PACK.phrases.find((phrase) => phrase.id === phraseId) ?? null;
}

export function listRegisteredPackIds(): string[] {
  return Object.keys(PACKS);
}
