import "server-only";

import {
  AZURE_TRANSLATOR_API_VERSION,
  AZURE_TRANSLATOR_REQUEST_TIMEOUT_MS,
} from "./constants";
import {
  AzureTranslatorRequestError,
  AzureTranslatorResponseError,
} from "./azure-translator-errors";
import {
  buildAzureTranslatorUrl,
  getAzureTranslatorConfig,
  type AzureTranslatorConfig,
} from "./azure-translator-config";
import type {
  AzureTranslatorFetch,
  AzureTranslateTextsInput,
  AzureTranslateTextsResult,
  AzureTransliterateTextsInput,
  AzureTransliterateTextsResult,
} from "./azure-translator.types";

type AzureTranslateResponseItem = {
  translations?: Array<{ text?: string; to?: string }>;
};

type AzureTransliterateResponseItem = {
  text?: string;
  script?: string;
};

function buildAzureHeaders(config: AzureTranslatorConfig): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": config.subscriptionKey,
    "Ocp-Apim-Subscription-Region": config.region,
  };
}

function createRequestSignal(): AbortSignal | undefined {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(AZURE_TRANSLATOR_REQUEST_TIMEOUT_MS);
  }
  return undefined;
}

async function executeAzureJsonRequest(input: {
  url: string;
  config: AzureTranslatorConfig;
  body: unknown;
  operation: "translate" | "transliterate";
  fetchImpl: AzureTranslatorFetch;
}): Promise<Response> {
  let response: Response;
  try {
    response = await input.fetchImpl(input.url, {
      method: "POST",
      headers: buildAzureHeaders(input.config),
      body: JSON.stringify(input.body),
      signal: createRequestSignal(),
    });
  } catch {
    throw new AzureTranslatorRequestError("Azure Translator network request failed", {
      operation: input.operation,
    });
  }

  if (!response.ok) {
    throw new AzureTranslatorRequestError("Azure Translator request failed", {
      statusCode: response.status,
      operation: input.operation,
    });
  }

  return response;
}

function parseTranslateResponse(
  payload: unknown,
  expectedCount: number,
): readonly string[] {
  if (!Array.isArray(payload)) {
    throw new AzureTranslatorResponseError("Invalid Azure translate response", "translate");
  }

  if (payload.length !== expectedCount) {
    throw new AzureTranslatorResponseError(
      "Unexpected Azure translate response length",
      "translate",
    );
  }

  const translations: string[] = [];
  for (const item of payload as AzureTranslateResponseItem[]) {
    const text = item.translations?.[0]?.text?.trim();
    if (!text) {
      throw new AzureTranslatorResponseError(
        "Missing Azure translate response item",
        "translate",
      );
    }
    translations.push(text);
  }

  return translations;
}

function parseTransliterateResponse(
  payload: unknown,
  expectedCount: number,
): readonly (string | null)[] {
  if (!Array.isArray(payload)) {
    throw new AzureTranslatorResponseError(
      "Invalid Azure transliterate response",
      "transliterate",
    );
  }

  if (payload.length !== expectedCount) {
    throw new AzureTranslatorResponseError(
      "Unexpected Azure transliterate response length",
      "transliterate",
    );
  }

  return (payload as AzureTransliterateResponseItem[]).map((item) => {
    const text = item.text?.trim();
    return text && text.length > 0 ? text : null;
  });
}

export async function translateTexts(
  input: AzureTranslateTextsInput,
  options?: { fetchImpl?: AzureTranslatorFetch; config?: AzureTranslatorConfig },
): Promise<AzureTranslateTextsResult> {
  if (input.texts.length === 0) {
    return { translations: [] };
  }

  const config = options?.config ?? getAzureTranslatorConfig();
  const fetchImpl = options?.fetchImpl ?? fetch;

  const url = buildAzureTranslatorUrl(config, "/translate", {
    "api-version": AZURE_TRANSLATOR_API_VERSION,
    from: input.from,
    to: input.to,
  });

  const response = await executeAzureJsonRequest({
    url,
    config,
    body: input.texts.map((text) => ({ Text: text })),
    operation: "translate",
    fetchImpl,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AzureTranslatorResponseError("Invalid Azure translate response body", "translate");
  }

  return {
    translations: parseTranslateResponse(payload, input.texts.length),
  };
}

export async function transliterateTexts(
  input: AzureTransliterateTextsInput,
  options?: { fetchImpl?: AzureTranslatorFetch; config?: AzureTranslatorConfig },
): Promise<AzureTransliterateTextsResult> {
  if (input.texts.length === 0) {
    return { transliterations: [] };
  }

  const config = options?.config ?? getAzureTranslatorConfig();
  const fetchImpl = options?.fetchImpl ?? fetch;

  const url = buildAzureTranslatorUrl(config, "/transliterate", {
    "api-version": AZURE_TRANSLATOR_API_VERSION,
    language: input.language,
    fromScript: input.fromScript,
    toScript: input.toScript,
  });

  const response = await executeAzureJsonRequest({
    url,
    config,
    body: input.texts.map((text) => ({ Text: text })),
    operation: "transliterate",
    fetchImpl,
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AzureTranslatorResponseError(
      "Invalid Azure transliterate response body",
      "transliterate",
    );
  }

  return {
    transliterations: parseTransliterateResponse(payload, input.texts.length),
  };
}
