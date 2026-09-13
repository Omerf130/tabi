import type { TravelDocumentCategory } from "./constants";

/** Traveler-facing visual filters — UI only; persisted enum unchanged. */
export type TravelWalletVisualFilter =
  | "all"
  | "flight"
  | "accommodation"
  | "train"
  | "ticket"
  | "insurance"
  | "more";

export type TravelWalletVisualFilterOption = {
  value: TravelWalletVisualFilter;
  label: string;
  icon:
    | "grid"
    | "plane"
    | "bed"
    | "train"
    | "ticket"
    | "shield"
    | "more";
};

const MORE_CATEGORIES: TravelDocumentCategory[] = [
  "reservation",
  "transport",
  "other",
];

export function filterDocumentsByVisualFilter<
  T extends { category: TravelDocumentCategory },
>(documents: T[], filter: TravelWalletVisualFilter): T[] {
  if (filter === "all") {
    return documents;
  }
  if (filter === "more") {
    return documents.filter((document) => MORE_CATEGORIES.includes(document.category));
  }
  return documents.filter((document) => document.category === filter);
}
