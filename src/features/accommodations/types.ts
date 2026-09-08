export type AccommodationPlaceSource = "google" | "manual";

export type AccommodationViewModel = {
  id: string;
  tripId: string;
  placeSource: AccommodationPlaceSource;
  googlePlaceId?: string;
  name: string;
  nameJapanese?: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  addressEnglish?: string;
  addressJapanese?: string;
  googleMapsUrl?: string;
  bookingReference?: string;
  notes?: string;
  checkInLabel: string;
  checkOutLabel: string;
  dateRangeLabel: string;
  nightCount: number;
  usesGoogleAttribution: boolean;
};

export type AccommodationSettingsViewModel = AccommodationViewModel & {
  manualName?: string;
  manualNameJapanese?: string;
  manualCity?: string;
  manualAddressEnglish?: string;
  manualAddressJapanese?: string;
  manualGoogleMapsUrl?: string;
};
