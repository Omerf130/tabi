/** Canonical English source for built-in phrase intents (Azure translation source). */
export const CANONICAL_PHRASE_SOURCE_LANGUAGE = "en" as const;

/** Bump when canonical English intent text changes to avoid reusing stale cache rows. */
export const PHRASE_TRANSLATION_CONTENT_VERSION = "2026-01" as const;

export const PHRASE_TRANSLATION_PROVIDER = "azure" as const;

export const AZURE_TRANSLATOR_API_VERSION = "3.0";

/** Default HTTP timeout for Azure Translator requests. */
export const AZURE_TRANSLATOR_REQUEST_TIMEOUT_MS = 30_000;
