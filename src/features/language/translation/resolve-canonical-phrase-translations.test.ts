import { beforeEach, describe, expect, it, vi } from "vitest";
import { PHRASE_INTENTS } from "../phrase-intent-catalog";
import { PHRASE_TRANSLATION_CONTENT_VERSION } from "./constants";
import { resolveCanonicalPhraseTranslations } from "./resolve-canonical-phrase-translations";
import type { PhraseTranslationCacheRow } from "./phrase-translation-cache-repository";

const translateTextsMock = vi.fn();
const transliterateTextsMock = vi.fn();
const findCacheMock = vi.fn();
const upsertCacheMock = vi.fn();

const sampleIntents = PHRASE_INTENTS.slice(0, 3);

function cacheRow(
  phraseId: string,
  targetLanguage: string,
  translatedText: string,
): PhraseTranslationCacheRow {
  return {
    phraseId,
    sourceLanguage: "en",
    targetLanguage,
    translatedText,
    transliterationLatin: null,
    contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
    provider: "azure",
  };
}

describe("resolveCanonicalPhraseTranslations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findCacheMock.mockResolvedValue(new Map());
    upsertCacheMock.mockResolvedValue(undefined);
    translateTextsMock.mockResolvedValue({
      translations: sampleIntents.map((intent) => `[it] ${intent.azureSourceText}`),
    });
    transliterateTextsMock.mockResolvedValue({
      transliterations: sampleIntents.map(() => "latn"),
    });
  });

  const deps = {
    translateTexts: translateTextsMock,
    transliterateTexts: transliterateTextsMock,
    findPhraseTranslationCacheRows: findCacheMock,
    upsertPhraseTranslationCacheRows: upsertCacheMock,
  };

  it("returns unavailable results without Azure calls when target language is unknown", async () => {
    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: null,
      phraseIntents: sampleIntents,
      deps,
    });

    expect(result.targetLanguage).toBeNull();
    expect(result.translations.every((entry) => entry.status === "unavailable")).toBe(true);
    expect(translateTextsMock).not.toHaveBeenCalled();
    expect(transliterateTextsMock).not.toHaveBeenCalled();
  });

  it("uses zero Azure translation calls on full cache hit", async () => {
    const cached = new Map(
      sampleIntents.map((intent) => [
        intent.id,
        cacheRow(intent.id, "it", `[cached] ${intent.id}`),
      ]),
    );
    findCacheMock.mockResolvedValue(cached);

    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "it",
      phraseIntents: sampleIntents,
      deps,
    });

    expect(result.stats.cacheHits).toBe(sampleIntents.length);
    expect(result.stats.cacheMisses).toBe(0);
    expect(result.stats.azureTranslateCalls).toBe(0);
    expect(translateTextsMock).not.toHaveBeenCalled();
    expect(transliterateTextsMock).not.toHaveBeenCalled();
    expect(result.translations.every((entry) => entry.fromCache)).toBe(true);
  });

  it("batch-translates only cache misses in catalog order", async () => {
    const cached = new Map([
      [sampleIntents[0]!.id, cacheRow(sampleIntents[0]!.id, "it", "Ciao")],
    ]);
    findCacheMock.mockResolvedValue(cached);

    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "it",
      phraseIntents: sampleIntents,
      deps,
    });

    expect(translateTextsMock).toHaveBeenCalledTimes(1);
    expect(translateTextsMock).toHaveBeenCalledWith({
      texts: [sampleIntents[1]!.azureSourceText, sampleIntents[2]!.azureSourceText],
      from: "en",
      to: "it",
    });
    expect(result.translations.map((entry) => entry.phraseId)).toEqual(
      sampleIntents.map((intent) => intent.id),
    );
    expect(result.stats.azureTranslateCalls).toBe(1);
    expect(upsertCacheMock).toHaveBeenCalledTimes(1);
  });

  it("avoids Azure translation for English targets and stores canonical English text", async () => {
    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "en",
      phraseIntents: sampleIntents,
      deps,
    });

    expect(translateTextsMock).not.toHaveBeenCalled();
    expect(result.translations[0]?.translatedText).toBe(sampleIntents[0]!.azureSourceText);
    expect(upsertCacheMock).toHaveBeenCalled();
  });

  it("uses the same Azure pipeline for Italian and Japanese targets", async () => {
    await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "it",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });
    await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "ja",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });

    expect(translateTextsMock).toHaveBeenNthCalledWith(1, {
      texts: ["Hello"],
      from: "en",
      to: "it",
    });
    expect(translateTextsMock).toHaveBeenNthCalledWith(2, {
      texts: ["Hello"],
      from: "en",
      to: "ja",
    });
  });

  it("never reads legacy he-ja Japanese target strings", async () => {
    await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "ja",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });

    const translateInput = translateTextsMock.mock.calls[0]?.[0];
    expect(translateInput.texts).toEqual(["Hello"]);
    expect(JSON.stringify(translateInput)).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/);
  });

  it("stores transliteration when supported and keeps translation when transliteration fails", async () => {
    transliterateTextsMock.mockRejectedValueOnce(new Error("transliterate failed"));

    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "ja",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });

    expect(result.translations[0]?.status).toBe("available");
    expect(result.translations[0]?.transliterationLatin).toBeNull();
  });

  it("stores transliteration for supported languages when provider succeeds", async () => {
    transliterateTextsMock.mockResolvedValueOnce({
      transliterations: ["konnichiwa"],
    });
    translateTextsMock.mockResolvedValueOnce({
      translations: ["こんにちは"],
    });

    const result = await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "ja",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });

    expect(result.translations[0]?.transliterationLatin).toBe("konnichiwa");
  });

  it("skips transliteration for unsupported target languages", async () => {
    await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "it",
      phraseIntents: [PHRASE_INTENTS[0]!],
      deps,
    });

    expect(transliterateTextsMock).not.toHaveBeenCalled();
  });

  it("includes contentVersion in cache lookup", async () => {
    await resolveCanonicalPhraseTranslations({
      targetTravelLanguageCode: "it",
      phraseIntents: sampleIntents,
      deps,
    });

    expect(findCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
        targetLanguage: "it",
      }),
    );
  });
});
