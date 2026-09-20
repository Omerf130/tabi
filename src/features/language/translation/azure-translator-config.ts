import "server-only";

import { AzureTranslatorConfigError } from "./azure-translator-errors";

export type AzureTranslatorConfig = {
  endpoint: string;
  region: string;
  subscriptionKey: string;
};

function normalizeEndpoint(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed.startsWith("https://")) {
    throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_ENDPOINT must be an HTTPS URL");
  }

  try {
    const url = new URL(trimmed);
    if (!url.hostname) {
      throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_ENDPOINT is invalid");
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
  } catch {
    throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_ENDPOINT is invalid");
  }
}

export function getAzureTranslatorConfig(): AzureTranslatorConfig {
  const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY?.trim();
  const region = process.env.AZURE_TRANSLATOR_REGION?.trim();
  const endpointRaw = process.env.AZURE_TRANSLATOR_ENDPOINT?.trim();

  if (!subscriptionKey) {
    throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_KEY is not configured");
  }
  if (!region) {
    throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_REGION is not configured");
  }
  if (!endpointRaw) {
    throw new AzureTranslatorConfigError("AZURE_TRANSLATOR_ENDPOINT is not configured");
  }

  return {
    subscriptionKey,
    region,
    endpoint: normalizeEndpoint(endpointRaw),
  };
}

export function buildAzureTranslatorUrl(
  config: AzureTranslatorConfig,
  path: "/translate" | "/transliterate",
  query: Record<string, string>,
): string {
  const url = new URL(`${config.endpoint}${path}`);
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
