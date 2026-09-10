import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { ContextualAccommodationVariant } from "./select-contextual-accommodation";
import type { AttentionListResult } from "./select-attention-list";
import type { TravelToolDefinition } from "./constants";

export type ContextualAccommodationCard = {
  accommodation: AccommodationViewModel;
  variant: ContextualAccommodationVariant;
  title: string;
  detailHref: string;
  taxiHref: string;
  placePhoto?: PlacePhotoPresentation;
  mapsHref?: string;
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
  contextualAccommodation: ContextualAccommodationCard | null;
  attentionList: AttentionListCard | null;
  tools: TravelToolViewModel[];
};
