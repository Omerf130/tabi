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
