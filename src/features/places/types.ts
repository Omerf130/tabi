export type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText?: string;
};

/** Ephemeral preview from resolve; not persisted in trip documents. */
export type ResolvedPlacePreview = {
  placeId: string;
  primaryText: string;
  secondaryText?: string;
  displayNameJapanese?: string;
  formattedAddressJapanese?: string;
  formattedAddress?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
};

/** Display fields resolved at read time for google-backed records. */
export type PlaceDisplaySnapshot = {
  placeId: string;
  name: string;
  nameJapanese?: string;
  city: string;
  addressEnglish?: string;
  addressJapanese?: string;
  googleMapsUrl?: string;
};

export type PlacePrimaryTypes = readonly string[];
