import { compareCalendarDates } from "@/features/trips/calendar-date";
import { compareTransportDepartureTimesForSameDay } from "./transport-datetime";
import { TRANSPORT_TYPE_SINGULAR_LABELS } from "./transport-types";
import type { TransportContextItem, TransportRecord } from "./types";

function buildRouteLabel(record: TransportRecord): string {
  return `${record.departure.locationName} → ${record.arrival.locationName}`;
}

export function buildTransportContextLabel(record: TransportRecord): string {
  const typeLabel = TRANSPORT_TYPE_SINGULAR_LABELS[record.type];
  const routeLabel = buildRouteLabel(record);
  return `${typeLabel} ${record.departure.time} — ${routeLabel}`;
}

export function selectTransportsDepartingOnDate(
  transports: readonly TransportRecord[],
  date: string,
): TransportContextItem[] {
  return transports
    .filter((record) => record.departure.date === date)
    .sort((left, right) => {
      const byTime = compareTransportDepartureTimesForSameDay(
        left.departure.time,
        right.departure.time,
      );
      if (byTime !== 0) {
        return byTime;
      }
      return left.id.localeCompare(right.id);
    })
    .map((record) => ({
      id: record.id,
      type: record.type,
      typeLabel: TRANSPORT_TYPE_SINGULAR_LABELS[record.type],
      departureDate: record.departure.date,
      departureTime: record.departure.time,
      routeLabel: buildRouteLabel(record),
      label: buildTransportContextLabel(record),
    }));
}

export function selectNextUpcomingTransport(
  transports: readonly TransportRecord[],
  fromDate: string,
  fromTime?: string,
): TransportContextItem | null {
  const candidates = transports
    .filter((record) => {
      const dateCompare = compareCalendarDates(record.departure.date, fromDate);
      if (dateCompare > 0) {
        return true;
      }
      if (dateCompare < 0 || !fromTime) {
        return false;
      }
      return compareTransportDepartureTimesForSameDay(record.departure.time, fromTime) >= 0;
    })
    .sort((left, right) => {
      const byDate = compareCalendarDates(left.departure.date, right.departure.date);
      if (byDate !== 0) {
        return byDate;
      }
      const byTime = compareTransportDepartureTimesForSameDay(
        left.departure.time,
        right.departure.time,
      );
      if (byTime !== 0) {
        return byTime;
      }
      return left.id.localeCompare(right.id);
    });

  const next = candidates[0];
  if (!next) {
    return null;
  }

  return {
    id: next.id,
    type: next.type,
    typeLabel: TRANSPORT_TYPE_SINGULAR_LABELS[next.type],
    departureDate: next.departure.date,
    departureTime: next.departure.time,
    routeLabel: buildRouteLabel(next),
    label: buildTransportContextLabel(next),
  };
}
