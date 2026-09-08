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

const MISSING_ADDRESS_MESSAGE =
  "לא הוזנה כתובת. הוסיפו כתובת בהגדרות הטיול.";

export function buildTaxiModeContent(
  accommodation: AccommodationTaxiFields,
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
      missingAddressMessage: hasAnyAddress ? undefined : MISSING_ADDRESS_MESSAGE,
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
    missingAddressMessage: primaryAddress ? undefined : MISSING_ADDRESS_MESSAGE,
    showJapaneseHierarchy: false,
  };
}
