import type { TransportType } from "./transport-types";
import type { TransportCardViewModel } from "./types";

export type TransportListFilter = "all" | "flight" | "train" | "other";

export type TransportFilterCounts = Record<TransportListFilter, number>;

const OTHER_TRANSPORT_TYPES = new Set<TransportType>(["bus", "ferry", "car", "taxi"]);

export function matchesTransportListFilter(
  type: TransportType,
  filter: TransportListFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "flight":
      return type === "flight";
    case "train":
      return type === "train";
    case "other":
      return OTHER_TRANSPORT_TYPES.has(type);
  }
}

export function filterTransportList(
  transports: readonly TransportCardViewModel[],
  filter: TransportListFilter,
): TransportCardViewModel[] {
  if (filter === "all") {
    return [...transports];
  }

  return transports.filter((transport) => matchesTransportListFilter(transport.type, filter));
}

export function countTransportsByFilter(
  transports: readonly TransportCardViewModel[],
): TransportFilterCounts {
  return {
    all: transports.length,
    flight: transports.filter((transport) => transport.type === "flight").length,
    train: transports.filter((transport) => transport.type === "train").length,
    other: transports.filter((transport) => OTHER_TRANSPORT_TYPES.has(transport.type)).length,
  };
}

export function getTransportFilterEmptyMessage(filter: TransportListFilter): string {
  switch (filter) {
    case "all":
      return "אין תחבורה";
    case "flight":
      return "אין עדיין טיסות בטיול הזה";
    case "train":
      return "אין עדיין רכבות בטיול הזה";
    case "other":
      return "אין עדיין נסיעות אחרות בטיול הזה";
  }
}

export const TRANSPORT_FILTER_TABS: Array<{
  id: TransportListFilter;
  label: string;
}> = [
  { id: "all", label: "הכל" },
  { id: "flight", label: "טיסות" },
  { id: "train", label: "רכבות" },
  { id: "other", label: "אחר" },
];

export function formatTransportFilterTabLabel(
  filter: TransportListFilter,
  count: number,
): string {
  const base = TRANSPORT_FILTER_TABS.find((tab) => tab.id === filter)?.label ?? filter;
  return `${base} (${count})`;
}
