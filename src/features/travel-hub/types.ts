import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { ContextualAccommodationVariant } from "./select-contextual-accommodation";
import type { AttentionListResult } from "./select-attention-list";
import type { TravelToolDefinition } from "./constants";

export type TravelHubHeroViewModel = {
  heroImageSrc: string;
  title: string;
  subtitle: string;
};

export type TravelHubMyTripCard = {
  href: string;
  name: string;
  dateRangeLabel: string;
  metaLabel: string;
  statusLabel: string;
  heroImageSrc: string;
};

export type ContextualAccommodationCard = {
  accommodation: AccommodationViewModel;
  variant: ContextualAccommodationVariant;
  title: string;
  detailHref: string;
  listHref: string;
  placePhoto?: PlacePhotoPresentation;
  showGoogleAttribution: boolean;
};

export type AttentionListCard = AttentionListResult & {
  href: string;
};

export type TravelToolViewModel = TravelToolDefinition & {
  href?: string;
};

export type TravelHubViewModel = {
  tripId: string;
  hero: TravelHubHeroViewModel;
  myTrip: TravelHubMyTripCard;
  contextualAccommodation: ContextualAccommodationCard | null;
  attentionList: AttentionListCard | null;
  tools: TravelToolViewModel[];
};
