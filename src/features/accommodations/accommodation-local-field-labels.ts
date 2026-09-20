import { resolvePlacesDisplayLanguageCode } from "@/features/trips/destination/resolve-places-display-language";

export type AccommodationLocalFieldMessageKeys = {
  nameLabelKey:
    | "nameJapanese"
    | "nameKorean"
    | "localName";
  addressLabelKey:
    | "addressJapanese"
    | "addressKorean"
    | "localAddress";
  manualNameLabelKey:
    | "manualNameJapanese"
    | "manualNameKorean"
    | "manualNameLocal";
  manualNameHintKey: "manualNameJapaneseHint" | "manualNameLocalHint";
};

export function resolveAccommodationLocalFieldMessageKeys(
  countryCode: string | null | undefined,
): AccommodationLocalFieldMessageKeys {
  const normalized = countryCode?.trim().toUpperCase();
  if (normalized === "JP") {
    return {
      nameLabelKey: "nameJapanese",
      addressLabelKey: "addressJapanese",
      manualNameLabelKey: "manualNameJapanese",
      manualNameHintKey: "manualNameJapaneseHint",
    };
  }
  if (normalized === "KR") {
    return {
      nameLabelKey: "nameKorean",
      addressLabelKey: "addressKorean",
      manualNameLabelKey: "manualNameKorean",
      manualNameHintKey: "manualNameLocalHint",
    };
  }
  return {
    nameLabelKey: "localName",
    addressLabelKey: "localAddress",
    manualNameLabelKey: "manualNameLocal",
    manualNameHintKey: "manualNameLocalHint",
  };
}

/** BCP 47 for local script fields; omit when unknown/neutral. */
export function resolveAccommodationLocalFieldLang(
  countryCode: string | null | undefined,
): string | undefined {
  const language = resolvePlacesDisplayLanguageCode(countryCode);
  if (language === "en") {
    return undefined;
  }
  return language;
}
