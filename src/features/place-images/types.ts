export type PlacePhotoAuthorAttribution = {
  displayName?: string;
  uri?: string;
  photoUri?: string;
};

export type PlacePhotoMetadata = {
  googlePlaceId: string;
  photoName: string;
  authorAttributions: PlacePhotoAuthorAttribution[];
};

/** Client-safe presentation for entity cards (no Google API key or photo names). */
export type PlacePhotoPresentation = {
  photoHref?: string;
  hasPhoto: boolean;
  authorAttributions: PlacePhotoAuthorAttribution[];
};
