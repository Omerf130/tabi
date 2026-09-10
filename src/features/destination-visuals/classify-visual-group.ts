import type { DestinationVisualGroup } from "./registry";

/** ISO 3166-1 alpha-2 European country codes used for visual grouping. */
export const EUROPE_COUNTRY_CODES = new Set([
  "AD",
  "AL",
  "AT",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HR",
  "HU",
  "IE",
  "IS",
  "IT",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "SE",
  "SI",
  "SK",
  "SM",
  "UA",
  "VA",
  "XK",
]);

export function classifyDestinationVisualGroup(
  countryCode: string | undefined | null,
): DestinationVisualGroup {
  const normalized = countryCode?.trim().toUpperCase();
  if (!normalized) {
    return "fallback";
  }
  if (normalized === "JP") {
    return "japan";
  }
  if (EUROPE_COUNTRY_CODES.has(normalized)) {
    return "europe";
  }
  return "fallback";
}
