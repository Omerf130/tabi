const RTL_PRIMARY_LANGUAGE_CODES = new Set(["ar", "he", "fa", "ur", "yi"]);

export function resolveLanguageTextDirection(
  languageCode: string | null | undefined,
): "ltr" | "rtl" {
  if (!languageCode?.trim()) {
    return "ltr";
  }

  const primary = languageCode.trim().split("-")[0]?.toLowerCase();
  if (!primary) {
    return "ltr";
  }

  return RTL_PRIMARY_LANGUAGE_CODES.has(primary) ? "rtl" : "ltr";
}
