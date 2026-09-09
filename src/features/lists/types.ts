import type { TripListSlug, TripListType } from "./constants";

export type TripListProgress = {
  totalCount: number;
  completedCount: number;
};

export type TripListSummaryViewModel = {
  type: TripListType;
  slug: TripListSlug;
  title: string;
  icon: "grid" | "plane" | "itinerary" | "shopping";
  progress: TripListProgress;
  progressLabel: string;
};

export type TripListItemViewModel = {
  id: string;
  listType: TripListType;
  text: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
};

export type TripListDetailViewModel = {
  type: TripListType;
  slug: TripListSlug;
  title: string;
  progress: TripListProgress;
  progressLabel: string;
  items: TripListItemViewModel[];
};
