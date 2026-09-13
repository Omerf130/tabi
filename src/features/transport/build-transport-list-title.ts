import type { TransportType } from "./transport-types";

function withDestination(prefix: string, destination: string): string {
  const trimmed = destination.trim();
  return trimmed ? `${prefix}${trimmed}` : prefix.replace(/ ל$/, "").trim();
}

export function buildTransportListTitle(
  type: TransportType,
  arrivalLocationName: string,
): string {
  const destination = arrivalLocationName.trim();

  switch (type) {
    case "flight":
      return withDestination("טיסה ל", destination);
    case "train":
      return withDestination("רכבת ל", destination);
    case "bus":
      return withDestination("אוטובוס ל", destination);
    case "ferry":
      return withDestination("מעבורת ל", destination);
    case "taxi":
      return withDestination("מונית ל", destination);
    case "car":
      return destination ? `רכב שכור · ${destination}` : "רכב שכור";
  }
}
