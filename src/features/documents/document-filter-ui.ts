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

export const TRAVEL_WALLET_VISUAL_FILTERS: TravelWalletVisualFilterOption[] = [
  { value: "all", label: "הכל", icon: "grid" },
  { value: "flight", label: "טיסות", icon: "plane" },
  { value: "accommodation", label: "לינה", icon: "bed" },
  { value: "train", label: "רכבות", icon: "train" },
  { value: "ticket", label: "כרטיסים", icon: "ticket" },
  { value: "insurance", label: "ביטוח", icon: "shield" },
  { value: "more", label: "עוד", icon: "more" },
];

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

export function formatDocumentCountHebrew(count: number): string {
  if (count === 1) {
    return "1 מסמך בארנק";
  }
  return `${count} מסמכים בארנק`;
}

export function formatLinkedCountHebrew(count: number): string {
  if (count === 1) {
    return "1 מסמך מקושר";
  }
  return `${count} מסמכים מקושרים`;
}
