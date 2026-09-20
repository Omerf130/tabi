import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CustomTranslationUnavailableError,
  CustomTranslationValidationError,
  translateCustomPhrase,
} from "./translate-custom-phrase.server";

const translateTextsMock = vi.fn();
const transliterateTextsMock = vi.fn();

vi.mock("./azure-translator.server", () => ({
  translateTexts: (...args: unknown[]) => translateTextsMock(...args),
  transliterateTexts: (...args: unknown[]) => transliterateTextsMock(...args),
}));

describe("translateCustomPhrase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    translateTextsMock.mockResolvedValue({ translations: ["Ciao"] });
    transliterateTextsMock.mockResolvedValue({ transliterations: ["chao"] });
  });

  it("uses Hebrew UI locale as source", async () => {
    await translateCustomPhrase({
      text: "שלום",
      uiLocale: "he",
      targetTravelLanguageCode: "it",
    });

    expect(translateTextsMock).toHaveBeenCalledWith({
      texts: ["שלום"],
      from: "he",
      to: "it",
    });
  });

  it("uses English UI locale as source", async () => {
    await translateCustomPhrase({
      text: "Hello",
      uiLocale: "en",
      targetTravelLanguageCode: "ja",
    });

    expect(translateTextsMock).toHaveBeenCalledWith({
      texts: ["Hello"],
      from: "en",
      to: "ja",
    });
  });

  it("rejects empty input", async () => {
    await expect(
      translateCustomPhrase({
        text: "   ",
        uiLocale: "en",
        targetTravelLanguageCode: "it",
      }),
    ).rejects.toBeInstanceOf(CustomTranslationValidationError);
    expect(translateTextsMock).not.toHaveBeenCalled();
  });

  it("rejects oversized input", async () => {
    await expect(
      translateCustomPhrase({
        text: "a".repeat(501),
        uiLocale: "en",
        targetTravelLanguageCode: "it",
      }),
    ).rejects.toBeInstanceOf(CustomTranslationValidationError);
  });

  it("does not call Azure when target is unknown", async () => {
    await expect(
      translateCustomPhrase({
        text: "Hello",
        uiLocale: "en",
        targetTravelLanguageCode: "xx-fake",
      }),
    ).rejects.toBeInstanceOf(CustomTranslationUnavailableError);
    expect(translateTextsMock).not.toHaveBeenCalled();
  });

  it("returns Latin transliteration for Japanese when supported", async () => {
    translateTextsMock.mockResolvedValue({ translations: ["こんにちは"] });

    const result = await translateCustomPhrase({
      text: "Hello",
      uiLocale: "en",
      targetTravelLanguageCode: "ja",
    });

    expect(result.translatedText).toBe("こんにちは");
    expect(result.transliterationLatin).toBe("chao");
    expect(transliterateTextsMock).toHaveBeenCalled();
  });

  it("keeps translation when transliteration fails", async () => {
    translateTextsMock.mockResolvedValue({ translations: ["こんにちは"] });
    transliterateTextsMock.mockRejectedValue(new Error("transliteration down"));

    const result = await translateCustomPhrase({
      text: "Hello",
      uiLocale: "en",
      targetTravelLanguageCode: "ja",
    });

    expect(result.translatedText).toBe("こんにちは");
    expect(result.transliterationLatin).toBeNull();
  });

  it("does not persist to phrase cache (server module has no cache import)", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/language/translation/translate-custom-phrase.server.ts"),
      "utf8",
    );
    expect(source).not.toContain("PhraseTranslationCache");
    expect(source).not.toContain("phrase-translation-cache");
  });
});
