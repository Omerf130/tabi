import type { EntityLinkedCostViewModel } from "@/features/finance/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";

export type AccommodationPlaceSource = "google" | "manual";

export type AccommodationViewModel = {
  id: string;
  tripId: string;
  placeSource: AccommodationPlaceSource;
  googlePlaceId?: string;
  name: string;
  nameJapanese?: string;
  city?: string;
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
  linkedCost?: EntityLinkedCostViewModel;
};

export type AccommodationListItemViewModel = AccommodationViewModel & {
  locationLabel?: string;
  dateRangeCompactLabel: string;
  nightCountLabel: string;
  detailHref: string;
  isCurrentStay: boolean;
  placePhoto?: PlacePhotoPresentation;
};

export type AccommodationSettingsViewModel = AccommodationViewModel & {
  manualName?: string;
  manualNameJapanese?: string;
  manualCity?: string;
  manualAddressEnglish?: string;
  manualAddressJapanese?: string;
  manualGoogleMapsUrl?: string;
};
