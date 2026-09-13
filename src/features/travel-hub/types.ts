import type { PlacePhotoPresentation } from "@/features/place-images/types";
import type { TravelHubFinanceSummary } from "@/features/finance/types";
import type { TravelHubQuickToolId } from "./constants";

export type TravelHubHeroViewModel = {
  heroImageSrc: string;
  title: string;
  subtitle: string;
};

export type TravelHubPrimaryToolRow = {
  href: string;
  title: string;
  countLabel: string | null;
  detailLine: string | null;
  emptyLine: string | null;
  thumbnail?: PlacePhotoPresentation;
  showGoogleAttribution?: boolean;
  thumbnailAlt?: string;
};

export type TravelHubMaterialsTile = {
  href: string;
  title: string;
  primaryLine: string;
  secondaryLine: string | null;
};

export type TravelHubQuickToolTile = {
  id: TravelHubQuickToolId;
  label: string;
  description: string;
  href: string;
  colorClass: string;
};

export type TravelHubManagementEntry = {
  href: string;
  label: string;
};

export type TravelHubViewModel = {
  tripId: string;
  hero: TravelHubHeroViewModel;
  accommodation: TravelHubPrimaryToolRow;
  transport: TravelHubPrimaryToolRow;
  finance: TravelHubFinanceSummary;
  materials: {
    lists: TravelHubMaterialsTile;
    documents: TravelHubMaterialsTile;
  };
  quickTools: TravelHubQuickToolTile[];
  management: TravelHubManagementEntry;
};
