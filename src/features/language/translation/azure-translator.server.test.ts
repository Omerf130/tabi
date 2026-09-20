import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  AzureTranslatorConfigError,
  sanitizeAzureTranslatorErrorMessage,
} from "./azure-translator-errors";
import { buildAzureTranslatorUrl, getAzureTranslatorConfig } from "./azure-translator-config";
import { translateTexts, transliterateTexts } from "./azure-translator.server";

const fetchMock = vi.fn();

const testConfig = {
  endpoint: "https://api.cognitive.microsofttranslator.com",
  region: "northeurope",
  subscriptionKey: "test-subscription-key",
};

describe("azure-translator.server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    process.env.AZURE_TRANSLATOR_KEY = testConfig.subscriptionKey;
    process.env.AZURE_TRANSLATOR_REGION = testConfig.region;
    process.env.AZURE_TRANSLATOR_ENDPOINT = testConfig.endpoint;
  });

  it("builds translate endpoint from configured base URL", () => {
    const url = buildAzureTranslatorUrl(testConfig, "/translate", {
      "api-version": "3.0",
      from: "en",
      to: "it",
    });
    expect(url).toBe(
      "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=en&to=it",
    );
  });

  it("throws config error when env variables are missing", () => {
    delete process.env.AZURE_TRANSLATOR_KEY;
    expect(() => getAzureTranslatorConfig()).toThrow(AzureTranslatorConfigError);
  });

  it("sends batch translate request with required headers and never echoes the key in errors", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [
        { translations: [{ text: "Ciao", to: "it" }] },
        { translations: [{ text: "Grazie", to: "it" }] },
      ],
    });

    const result = await translateTexts(
      { texts: ["Hello", "Thank you"], from: "en", to: "it" },
      { config: testConfig },
    );

    expect(result.translations).toEqual(["Ciao", "Grazie"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/translate?");
    expect(String(url)).toContain("from=en");
    expect(String(url)).toContain("to=it");
    expect(init.headers["Ocp-Apim-Subscription-Key"]).toBe("test-subscription-key");
    expect(init.headers["Ocp-Apim-Subscription-Region"]).toBe("northeurope");
    expect(JSON.parse(String(init.body))).toEqual([
      { Text: "Hello" },
      { Text: "Thank you" },
    ]);

    const mapped = sanitizeAzureTranslatorErrorMessage(
      new Error("Ocp-Apim-Subscription-Key invalid"),
    );
    expect(mapped).not.toContain("test-subscription-key");
    expect(mapped).toBe("Azure Translator request failed");
  });

  it("maps non-2xx provider failures to typed request errors", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ error: { message: "upstream unavailable" } }),
    });

    await expect(
      translateTexts({ texts: ["Hello"], from: "en", to: "it" }, { config: testConfig }),
    ).rejects.toMatchObject({
      name: "AzureTranslatorRequestError",
      statusCode: 503,
      operation: "translate",
    });
  });

  it("rejects malformed translate responses", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ translations: [] }],
    });

    await expect(
      translateTexts({ texts: ["Hello"], from: "en", to: "it" }, { config: testConfig }),
    ).rejects.toMatchObject({
      name: "AzureTranslatorResponseError",
      operation: "translate",
    });
  });

  it("supports transliteration batch requests", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ text: "konnichiwa", script: "Latn" }],
    });

    const result = await transliterateTexts(
      {
        texts: ["こんにちは"],
        language: "ja",
        fromScript: "Jpan",
        toScript: "Latn",
      },
      { config: testConfig },
    );

    expect(result.transliterations).toEqual(["konnichiwa"]);
    const [url] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/transliterate?");
    expect(String(url)).toContain("language=ja");
  });
});
