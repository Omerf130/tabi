import type { TripListType } from "./constants";

export type ListSeedCatalogEntry = {
  listType: TripListType;
  messageKey: string;
  order: number;
  profile: "generic" | "jp";
};

/** Generic travel baseline — all destinations. */
export const GENERIC_LIST_SEED_CATALOG: readonly ListSeedCatalogEntry[] = [
  { listType: "packing", messageKey: "passport", order: 0, profile: "generic" },
  { listType: "packing", messageKey: "phoneCharger", order: 1, profile: "generic" },
  { listType: "packing", messageKey: "powerBank", order: 2, profile: "generic" },
  { listType: "packing", messageKey: "walkingClothes", order: 3, profile: "generic" },
  { listType: "packing", messageKey: "medications", order: 4, profile: "generic" },
  { listType: "packing", messageKey: "compactUmbrella", order: 5, profile: "generic" },

  { listType: "before_trip", messageKey: "travelInsurance", order: 0, profile: "generic" },
  { listType: "before_trip", messageKey: "flightCheckIn", order: 1, profile: "generic" },
  { listType: "before_trip", messageKey: "documentsInWallet", order: 2, profile: "generic" },
  { listType: "before_trip", messageKey: "offlineMaps", order: 3, profile: "generic" },

  { listType: "during_trip", messageKey: "dailyCharges", order: 0, profile: "generic" },
  { listType: "during_trip", messageKey: "saveTickets", order: 1, profile: "generic" },
  { listType: "during_trip", messageKey: "photoBackup", order: 2, profile: "generic" },
  { listType: "during_trip", messageKey: "nextDayWeather", order: 3, profile: "generic" },
  { listType: "during_trip", messageKey: "trimDayBag", order: 4, profile: "generic" },

  { listType: "pre_trip_shopping", messageKey: "powerBankShop", order: 0, profile: "generic" },
  { listType: "pre_trip_shopping", messageKey: "walkingShoes", order: 1, profile: "generic" },
  { listType: "pre_trip_shopping", messageKey: "luggageCover", order: 2, profile: "generic" },
  { listType: "pre_trip_shopping", messageKey: "toiletriesTravelSize", order: 3, profile: "generic" },
  { listType: "pre_trip_shopping", messageKey: "smallDayBag", order: 4, profile: "generic" },
];

/** Japan destination overlay — appended after generic baseline for JP trips only. */
export const JP_LIST_SEED_CATALOG: readonly ListSeedCatalogEntry[] = [
  { listType: "packing", messageKey: "jpTypeAAdapter", order: 6, profile: "jp" },
  { listType: "packing", messageKey: "jpIcCardPrep", order: 7, profile: "jp" },
  { listType: "before_trip", messageKey: "jpEsim", order: 4, profile: "jp" },
  { listType: "before_trip", messageKey: "jpJrPass", order: 5, profile: "jp" },
  { listType: "during_trip", messageKey: "jpIcTopUp", order: 5, profile: "jp" },
  { listType: "pre_trip_shopping", messageKey: "jpAdapterShop", order: 5, profile: "jp" },
];

export function resolveListSeedCatalog(countryCode: string | undefined | null): readonly ListSeedCatalogEntry[] {
  const normalized = countryCode?.trim().toUpperCase();
  if (normalized === "JP") {
    return [...GENERIC_LIST_SEED_CATALOG, ...JP_LIST_SEED_CATALOG];
  }
  return GENERIC_LIST_SEED_CATALOG;
}
