import type { TripListType } from "./constants";

export type DefaultTripListItemTemplate = {
  listType: TripListType;
  text: string;
  order: number;
};

/** @deprecated Legacy Hebrew-only seed; new trips use buildListSeedItems with UI locale. */
export const DEFAULT_TRIP_LIST_ITEMS: readonly DefaultTripListItemTemplate[] = [];
