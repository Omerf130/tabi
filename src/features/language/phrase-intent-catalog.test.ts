import { describe, expect, it } from "vitest";
import enMessages from "../../../messages/en.json";
import heMessages from "../../../messages/he.json";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { HE_JA_PHRASES } from "./builtin/he-ja";
import { getDefaultPhrasebookPack } from "./builtin/registry";
import {
  PHRASE_INTENTS,
  getPhraseIntentById,
  listPhraseIntentsInCatalogOrder,
} from "./phrase-intent-catalog";
import { getPhraseIntentUiSourceText } from "./phrase-intent-i18n";
import { resolvePhraseIntentMessageKey } from "./phrase-intent-message-key";
import { EXPECTED_PHRASE_INTENT_COUNT } from "./phrase-intent-types";
import { PHRASEBOOK_CATEGORIES } from "./types";

const JAPANESE_TEXT_PATTERN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

type LanguagePhrases = Record<string, Record<string, string>>;

function readPhraseFromMessages(
  phrases: LanguagePhrases,
  messageKey: string,
): string | undefined {
  const relativeKey = messageKey.replace(/^phrases\./, "");
  const separatorIndex = relativeKey.indexOf(".");
  if (separatorIndex <= 0) {
    return undefined;
  }
  const category = relativeKey.slice(0, separatorIndex);
  const slug = relativeKey.slice(separatorIndex + 1);
  return phrases[category]?.[slug];
}

function collectMessageKeys(node: unknown, prefix = ""): string[] {
  if (typeof node !== "object" || node === null) {
    return prefix ? [prefix] : [];
  }

  const entries = Object.entries(node as Record<string, unknown>);
  if (entries.length === 0) {
    return prefix ? [prefix] : [];
  }

  const keys: string[] = [];
  for (const [key, value] of entries) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      keys.push(nextPrefix);
      continue;
    }
    keys.push(...collectMessageKeys(value, nextPrefix));
  }
  return keys;
}

describe("phrase intent catalog (G8.2)", () => {
  it("has the expected phrase count", () => {
    expect(PHRASE_INTENTS.length).toBe(EXPECTED_PHRASE_INTENT_COUNT);
    expect(PHRASE_INTENTS.length).toBe(58);
  });

  it("uses unique ids and valid categories", () => {
    const ids = new Set<string>();

    for (const intent of PHRASE_INTENTS) {
      expect(ids.has(intent.id)).toBe(false);
      ids.add(intent.id);
      expect(PHRASEBOOK_CATEGORIES).toContain(intent.category);
      expect(intent.id.startsWith(`${intent.category}.`)).toBe(true);
    }

    expect(ids.size).toBe(PHRASE_INTENTS.length);
  });

  it("preserves stable legacy ids and deterministic order", () => {
    const legacyIds = HE_JA_PHRASES.map((phrase) => phrase.id);
    const catalogIds = listPhraseIntentsInCatalogOrder().map((intent) => intent.id);
    expect(catalogIds).toEqual(legacyIds);
  });

  it("requires non-empty canonical English Azure source text", () => {
    for (const intent of PHRASE_INTENTS) {
      expect(intent.azureSourceText.trim().length).toBeGreaterThan(0);
      expect(JAPANESE_TEXT_PATTERN.test(intent.azureSourceText)).toBe(false);
    }
  });

  it("has matching Hebrew and English UI source messages for every intent", () => {
    const hePhrases = heMessages.Language.phrases as LanguagePhrases;
    const enPhrases = enMessages.Language.phrases as LanguagePhrases;

    for (const intent of PHRASE_INTENTS) {
      const heText = readPhraseFromMessages(hePhrases, intent.messageKey);
      const enText = readPhraseFromMessages(enPhrases, intent.messageKey);

      expect(heText?.trim().length).toBeGreaterThan(0);
      expect(enText?.trim().length).toBeGreaterThan(0);
      expect(enText).toBe(intent.azureSourceText);
    }
  });

  it("keeps identical phrase message key coverage in Hebrew and English", () => {
    const heKeys = collectMessageKeys(heMessages.Language.phrases).sort();
    const enKeys = collectMessageKeys(enMessages.Language.phrases).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it("does not include Japanese target content or ja-specific fields", () => {
    for (const intent of PHRASE_INTENTS) {
      expect(Object.keys(intent)).not.toContain("targetLanguage");
      expect(Object.keys(intent)).not.toContain("targetText");
      expect(JSON.stringify(intent)).not.toMatch(JAPANESE_TEXT_PATTERN);

      for (const keyword of intent.searchKeywords ?? []) {
        expect(JAPANESE_TEXT_PATTERN.test(keyword)).toBe(false);
      }
    }
  });

  it("resolves message keys from ids", () => {
    expect(resolvePhraseIntentMessageKey("transport.where-station")).toBe(
      "phrases.transport.where-station",
    );
    expect(getPhraseIntentById("transport.where-station")?.messageKey).toBe(
      "phrases.transport.where-station",
    );
  });

  it("is global — no trip destination or UI locale on intents", () => {
    for (const intent of PHRASE_INTENTS) {
      const serialized = JSON.stringify(intent);
      expect(serialized).not.toContain("countryCode");
      expect(serialized).not.toContain("travelLanguage");
      expect(serialized).not.toContain("destination");
      expect(Object.keys(intent)).not.toContain("locale");
    }
  });

  it("UI source text comes from next-intl, not from catalog locale fields", () => {
    const intentId = "restaurants.no-meat";
    const tHe = createAppTranslator("Language", "he");
    const tEn = createAppTranslator("Language", "en");

    expect(getPhraseIntentUiSourceText(intentId, tHe)).toBe("בלי בשר, בבקשה");
    expect(getPhraseIntentUiSourceText(intentId, tEn)).toBe("Without meat, please");
  });

  it("preserves legacy runtime phrasebook pack independently", () => {
    const pack = getDefaultPhrasebookPack();
    expect(pack.phrases.length).toBeGreaterThanOrEqual(58);
    expect(pack.targetLanguage).toBe("ja");
  });
});
