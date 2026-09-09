import { compareCalendarDates } from "@/features/trips/calendar-date";
import { compareWallClockTimes } from "@/features/itinerary/time";
import type { TransportEndpoint } from "./types";

function parseEndpointParts(endpoint: Pick<TransportEndpoint, "date" | "time">): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
} {
  const [year, month, day] = endpoint.date.split("-").map(Number);
  const [hour, minute] = endpoint.time.split(":").map(Number);
  return {
    year: year!,
    month: month!,
    day: day!,
    hour: hour!,
    minute: minute!,
  };
}

export function toEndpointInstantUtc(endpoint: TransportEndpoint): number {
  const parts = parseEndpointParts(endpoint);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: endpoint.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    hour12: false,
  });

  let guess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const mapped = formatter.formatToParts(new Date(guess));
    const values = Object.fromEntries(
      mapped
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    ) as Record<string, number>;

    const mappedUtc = Date.UTC(
      values.year!,
      values.month! - 1,
      values.day!,
      values.hour!,
      values.minute!,
    );

    const targetUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
    );

    const delta = targetUtc - mappedUtc;
    if (delta === 0) {
      return guess;
    }

    guess += delta;
  }

  return guess;
}

export function compareTransportEndpoints(
  left: TransportEndpoint,
  right: TransportEndpoint,
): number {
  return toEndpointInstantUtc(left) - toEndpointInstantUtc(right);
}

export function isArrivalAfterDeparture(
  departure: TransportEndpoint,
  arrival: TransportEndpoint,
): boolean {
  return compareTransportEndpoints(departure, arrival) < 0;
}

export function formatEndpointTimeLabel(time: string): string {
  return time;
}

export function formatTransportTimeRangeLabel(
  departure: TransportEndpoint,
  arrival: TransportEndpoint,
): string {
  const dayOffset = compareCalendarDates(arrival.date, departure.date);
  const suffix = dayOffset > 0 ? ` (+${dayOffset})` : "";
  return `${departure.time} → ${arrival.time}${suffix}`;
}

export function compareTransportDepartureTimesForSameDay(
  leftTime: string,
  rightTime: string,
): number {
  return compareWallClockTimes(leftTime, rightTime);
}
