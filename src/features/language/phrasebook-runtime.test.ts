import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS } from "@/features/trips/public-trip";
import type { TripWorkspace } from "@/features/trips/public-trip";
import {
  buildLanguagePageViewModel,
  buildPhraseDetailViewModelForTrip,
} from "./prepare-phrasebook-runtime";
import { resolveLanguageTextDirection } from "./resolve-language-text-direction";
import { PHRASE_INTENTS } from "./phrase-intent-catalog";
import { CANONICAL_PHRASE_SOURCE_LANGUAGE, PHRASE_TRANSLATION_CONTENT_VERSION } from "./translation/constants";

const userId = "507f1f77bcf86cd799439011";
const tripId = "507f1f77bcf86cd799439011";

const resolveCanonicalPhraseTranslationsMock = vi.fn();
const findPhraseTranslationCacheRowsMock = vi.fn();
const listFavoritePhraseIdsMock = vi.fn();

vi.mock("./translation/resolve-canonical-phrase-translations", () => ({
  resolveCanonicalPhraseTranslations: (...args: unknown[]) =>
    resolveCanonicalPhraseTranslationsMock(...args),
}));

vi.mock("./translation/phrase-translation-cache-repository", () => ({
  findPhraseTranslationCacheRows: (...args: unknown[]) =>
    findPhraseTranslationCacheRowsMock(...args),
}));

vi.mock("./phrase-favorite-domain", () => ({
  listFavoritePhraseIds: (...args: unknown[]) => listFavoritePhraseIdsMock(...args),
}));

function makeTrip(overrides: Partial<TripWorkspace> = {}): TripWorkspace {
  return {
    id: tripId,
    name: "Trip",
    description: "",
    startDate: "2026-01-01",
    endDate: "2026-01-07",
    role: "owner",
    themeKey: "default",
    destinationCalendarTimeZone: "UTC",
    ...UNKNOWN_TRIP_TRAVEL_LANGUAGE_FIELDS,
    effectiveTravelLanguageCode: "ja",
    travelLanguageSource: "country-default",
    alternativeTravelLanguageCodes: [],
    ...overrides,
  };
}

function mockTranslationResult(
  targetLanguage: string,
  phraseIds: readonly string[],
  transliterationLatin: string | null = null,
) {
  return {
    targetLanguage,
    translations: phraseIds.map((phraseId) => ({
      phraseId,
      sourceLanguage: CANONICAL_PHRASE_SOURCE_LANGUAGE,
      targetLanguage,
      translatedText: `[${targetLanguage}] ${phraseId}`,
      transliterationLatin,
      status: "available" as const,
      fromCache: false,
      contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
    })),
    stats: {
      cacheHits: 0,
      cacheMisses: phraseIds.length,
      azureTranslateCalls: 1,
      azureTransliterateCalls: 0,
    },
  };
}

describe("phrasebook runtime (G8.4)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listFavoritePhraseIdsMock.mockResolvedValue([]);
    findPhraseTranslationCacheRowsMock.mockResolvedValue(new Map());
    resolveCanonicalPhraseTranslationsMock.mockImplementation(
      async ({ targetTravelLanguageCode, phraseIntents }) =>
        mockTranslationResult(
          targetTravelLanguageCode,
          phraseIntents.map((intent: { id: string }) => intent.id),
        ),
    );
  });

  it("uses Hebrew source and Japanese target for HE UI on JP trip", async () => {
    const tHe = createAppTranslator("Language", "he");
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "ja" }),
      userId,
      uiLocale: "he",
      t: tHe,
    });

    const hello = page.phrases.find((phrase) => phrase.id === "basics.hello");
    expect(hello?.sourceText).toBe("שלום");
    expect(hello?.targetTextPreview).toBe("[ja] basics.hello");
    expect(page.targetLanguage).toBe("ja");
  });

  it("uses English source and Japanese target for EN UI on JP trip", async () => {
    const tEn = createAppTranslator("Language", "en");
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "ja" }),
      userId,
      uiLocale: "en",
      t: tEn,
    });

    const hello = page.phrases.find((phrase) => phrase.id === "basics.hello");
    expect(hello?.sourceText).toBe("Hello");
    expect(hello?.targetTextPreview).toContain("[ja]");
  });

  it("enables custom translation when effective travel language exists", async () => {
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "it" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });

    expect(page.customTranslationEnabled).toBe(true);
    expect(page.travelLanguageSettingsHref).toContain("/manage/language");
  });

  it("disables custom translation when travel language is unknown", async () => {
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: null, travelLanguageSource: "unknown" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });

    expect(page.customTranslationEnabled).toBe(false);
  });

  it("uses Italian target for IT trip without Japanese content", async () => {
    const tHe = createAppTranslator("Language", "he");
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "it" }),
      userId,
      uiLocale: "he",
      t: tHe,
    });

    expect(page.targetLanguage).toBe("it");
    expect(JSON.stringify(page.phrases)).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/);
    expect(resolveCanonicalPhraseTranslationsMock).toHaveBeenCalledWith(
      expect.objectContaining({ targetTravelLanguageCode: "it" }),
    );
  });

  it("uses Spanish target for EN UI + ES effective language", async () => {
    const tEn = createAppTranslator("Language", "en");
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({
        effectiveTravelLanguageCode: "es",
        travelLanguageSource: "override",
      }),
      userId,
      uiLocale: "en",
      t: tEn,
    });

    expect(page.targetLanguage).toBe("es");
    expect(page.phrases[0]?.sourceText).toBeTruthy();
    expect(page.phrases[0]?.targetTextPreview).toContain("[es]");
  });

  it("supports another non-Japan destination such as KR", async () => {
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "ko" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });
    expect(page.targetLanguage).toBe("ko");
  });

  it("renders neutral unknown state without Azure calls", async () => {
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({
        effectiveTravelLanguageCode: null,
        travelLanguageSource: "unknown",
      }),
      userId,
      uiLocale: "he",
      t: createAppTranslator("Language", "he"),
    });

    expect(page.runtimeState).toBe("unknown_travel_language");
    expect(page.phrases).toEqual([]);
    expect(resolveCanonicalPhraseTranslationsMock).not.toHaveBeenCalled();
  });

  it("honors explicit effective travel language override on workspace", async () => {
    await buildLanguagePageViewModel({
      trip: makeTrip({
        effectiveTravelLanguageCode: "es",
        travelLanguageCode: "es",
        travelLanguageSource: "override",
      }),
      userId,
      uiLocale: "he",
      t: createAppTranslator("Language", "he"),
    });

    expect(resolveCanonicalPhraseTranslationsMock).toHaveBeenCalledWith(
      expect.objectContaining({ targetTravelLanguageCode: "es" }),
    );
  });

  it("loads favorites for the current effective target language", async () => {
    listFavoritePhraseIdsMock.mockResolvedValue(["basics.hello"]);
    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "ja" }),
      userId,
      uiLocale: "he",
      t: createAppTranslator("Language", "he"),
    });

    expect(listFavoritePhraseIdsMock).toHaveBeenCalledWith(userId, "ja");
    expect(page.favoritePhraseIds).toEqual(["basics.hello"]);
  });

  it("keeps list and detail parity for the same phrase", async () => {
    resolveCanonicalPhraseTranslationsMock.mockImplementation(async () =>
      mockTranslationResult("it", ["restaurants.no-meat"], "senza carne"),
    );

    const tEn = createAppTranslator("Language", "en");
    const trip = makeTrip({ effectiveTravelLanguageCode: "it" });
    const page = await buildLanguagePageViewModel({
      trip,
      userId,
      uiLocale: "en",
      t: tEn,
    });
    const detail = await buildPhraseDetailViewModelForTrip({
      trip,
      userId,
      phraseId: "restaurants.no-meat",
      t: tEn,
    });

    const listRow = page.phrases.find((phrase) => phrase.id === "restaurants.no-meat");
    expect(listRow?.targetTextPreview).toBe(detail?.targetText);
    expect(listRow?.sourceText).toBe(detail?.sourceText);
    expect(detail?.transliterationLatin).toBe("senza carne");
  });

  it("includes localized source, target, keywords, and transliteration in search blob", async () => {
    resolveCanonicalPhraseTranslationsMock.mockImplementation(async () =>
      mockTranslationResult("ja", ["transport.where-station"], "eki"),
    );

    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "ja" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });

    const row = page.phrases.find((phrase) => phrase.id === "transport.where-station");
    expect(row?.searchBlob).toContain("where is the station");
    expect(row?.searchBlob).toContain("[ja] transport.where-station");
    expect(row?.searchBlob).toContain("station");
    expect(row?.searchBlob).toContain("eki");
  });

  it("falls back to cache and avoids Japanese when provider fails", async () => {
    resolveCanonicalPhraseTranslationsMock.mockRejectedValue(new Error("azure down"));
    findPhraseTranslationCacheRowsMock.mockResolvedValue(
      new Map([
        [
          "basics.hello",
          {
            phraseId: "basics.hello",
            sourceLanguage: "en",
            targetLanguage: "it",
            translatedText: "Ciao",
            transliterationLatin: null,
            contentVersion: PHRASE_TRANSLATION_CONTENT_VERSION,
            provider: "azure",
          },
        ],
      ]),
    );

    const page = await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "it" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });

    expect(page.runtimeState).toBe("translation_unavailable");
    const hello = page.phrases.find((phrase) => phrase.id === "basics.hello");
    expect(hello?.targetTextPreview).toBe("Ciao");
    expect(hello?.targetTextPreview).not.toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/);
  });

  it("resolves RTL direction for Arabic and Hebrew targets", () => {
    expect(resolveLanguageTextDirection("ar")).toBe("rtl");
    expect(resolveLanguageTextDirection("he")).toBe("rtl");
    expect(resolveLanguageTextDirection("ja")).toBe("ltr");
    expect(resolveLanguageTextDirection("it")).toBe("ltr");
  });

  it("requests full catalog translation in one domain call", async () => {
    await buildLanguagePageViewModel({
      trip: makeTrip({ effectiveTravelLanguageCode: "fr" }),
      userId,
      uiLocale: "en",
      t: createAppTranslator("Language", "en"),
    });

    expect(resolveCanonicalPhraseTranslationsMock).toHaveBeenCalledTimes(1);
    expect(resolveCanonicalPhraseTranslationsMock.mock.calls[0]?.[0].phraseIntents).toHaveLength(
      PHRASE_INTENTS.length,
    );
  });

  it("requests only one intent for phrase detail", async () => {
    await buildPhraseDetailViewModelForTrip({
      trip: makeTrip({ effectiveTravelLanguageCode: "de" }),
      userId,
      phraseId: "basics.please",
      t: createAppTranslator("Language", "en"),
    });

    expect(resolveCanonicalPhraseTranslationsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        phraseIntents: [expect.objectContaining({ id: "basics.please" })],
      }),
    );
  });
});

describe("phrasebook runtime guardrails", () => {
  it("does not import legacy he-ja pack in runtime modules", () => {
    const files = [
      "src/features/language/queries.ts",
      "src/features/language/prepare-phrasebook-runtime.ts",
      "src/features/language/actions.ts",
      "src/features/language/phrase-favorite-domain.ts",
      "src/app/app/trips/[tripId]/language/translate/route.ts",
    ];

    for (const file of files) {
      const source = readFileSync(join(process.cwd(), file), "utf8");
      expect(source).not.toContain("getDefaultPhrasebookPack");
      expect(source).not.toContain("HE_JA_PHRASES");
    }

    const translateRoute = readFileSync(
      join(process.cwd(), "src/app/app/trips/[tripId]/language/translate/route.ts"),
      "utf8",
    );
    expect(translateRoute).not.toContain("PhraseTranslationCache");
  });
});
