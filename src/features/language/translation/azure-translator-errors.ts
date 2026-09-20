export class AzureTranslatorConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AzureTranslatorConfigError";
  }
}

export class AzureTranslatorRequestError extends Error {
  readonly statusCode?: number;
  readonly operation: "translate" | "transliterate";

  constructor(
    message: string,
    options: { statusCode?: number; operation: "translate" | "transliterate" },
  ) {
    super(message);
    this.name = "AzureTranslatorRequestError";
    this.statusCode = options.statusCode;
    this.operation = options.operation;
  }
}

export class AzureTranslatorResponseError extends Error {
  readonly operation: "translate" | "transliterate";

  constructor(message: string, operation: "translate" | "transliterate") {
    super(message);
    this.name = "AzureTranslatorResponseError";
    this.operation = operation;
  }
}

export function sanitizeAzureTranslatorErrorMessage(error: unknown): string {
  const fallback = "Azure Translator request failed";
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message;
  if (/subscription|api[_-]?key|ocp-apim/i.test(message)) {
    return fallback;
  }

  return message.slice(0, 200) || fallback;
}
