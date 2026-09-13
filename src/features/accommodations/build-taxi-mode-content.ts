import type { AccommodationTaxiFields } from "./build-taxi-mode-content-types";

export type TaxiModeContent = {
  primaryName: string;
  primaryNameLang: "ja" | "he";
  secondaryName?: string;
  primaryAddress?: string;
  primaryAddressLang?: "ja" | "en";
  secondaryAddress?: string;
  missingAddressMessage?: string;
  showJapaneseHierarchy: boolean;
};

export function buildTaxiModeContent(
  accommodation: AccommodationTaxiFields,
  missingAddressMessage: string,
): TaxiModeContent {
  const nameJapanese = accommodation.nameJapanese?.trim();
  const addressJapanese = accommodation.addressJapanese?.trim();
  const addressEnglish = accommodation.addressEnglish?.trim();
  const hasJapaneseName = Boolean(nameJapanese);
  const hasJapaneseAddress = Boolean(addressJapanese);
  const hasEnglishAddress = Boolean(addressEnglish);

  if (hasJapaneseName) {
    const hasAnyAddress = hasJapaneseAddress || hasEnglishAddress;
    return {
      primaryName: nameJapanese!,
      primaryNameLang: "ja",
      secondaryName: accommodation.name,
      primaryAddress: hasJapaneseAddress ? addressJapanese : undefined,
      primaryAddressLang: hasJapaneseAddress ? "ja" : undefined,
      secondaryAddress: hasEnglishAddress ? addressEnglish : undefined,
      missingAddressMessage: hasAnyAddress ? undefined : missingAddressMessage,
      showJapaneseHierarchy: true,
    };
  }

  const primaryAddress = hasJapaneseAddress
    ? addressJapanese
    : hasEnglishAddress
      ? addressEnglish
      : undefined;
  const primaryAddressLang = hasJapaneseAddress
    ? "ja"
    : hasEnglishAddress
      ? "en"
      : undefined;
  const secondaryAddress =
    hasJapaneseAddress && hasEnglishAddress ? addressEnglish : undefined;

  return {
    primaryName: accommodation.name,
    primaryNameLang: "he",
    primaryAddress,
    primaryAddressLang,
    secondaryAddress,
    missingAddressMessage: primaryAddress ? undefined : missingAddressMessage,
    showJapaneseHierarchy: false,
  };
}
