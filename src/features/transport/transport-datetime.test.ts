import { describe, expect, it } from "vitest";
import {
  compareTransportEndpoints,
  formatTransportTimeRangeLabel,
  isArrivalAfterDeparture,
  toEndpointInstantUtc,
} from "./transport-datetime";
import type { TransportEndpoint } from "./types";

function endpoint(
  date: string,
  time: string,
  timezone: string,
  locationName = "Place",
): TransportEndpoint {
  return { locationName, date, time, timezone };
}

describe("transport datetime", () => {
  it("compares endpoints across timezones using UTC instants", () => {
    const departure = endpoint("2026-10-25", "23:30", "Asia/Tokyo", "Tokyo");
    const arrival = endpoint("2026-10-25", "18:00", "Asia/Jerusalem", "Tel Aviv");

    expect(isArrivalAfterDeparture(departure, arrival)).toBe(true);
    expect(compareTransportEndpoints(departure, arrival)).toBeLessThan(0);
  });

  it("validates cross-midnight chronology in the same timezone", () => {
    const departure = endpoint("2026-10-25", "23:45", "Asia/Tokyo");
    const arrival = endpoint("2026-10-26", "01:15", "Asia/Tokyo");

    expect(isArrivalAfterDeparture(departure, arrival)).toBe(true);
  });

  it("rejects arrival before departure", () => {
    const departure = endpoint("2026-10-25", "12:00", "Asia/Tokyo");
    const arrival = endpoint("2026-10-25", "11:59", "Asia/Tokyo");

    expect(isArrivalAfterDeparture(departure, arrival)).toBe(false);
  });

  it("formats day offset in time range label", () => {
    const label = formatTransportTimeRangeLabel(
      endpoint("2026-10-25", "22:00", "Asia/Tokyo"),
      endpoint("2026-10-26", "06:00", "Asia/Tokyo"),
    );

    expect(label).toBe("22:00 → 06:00 (+1)");
  });

  it("handles DST transition instants consistently", () => {
    const beforeDst = toEndpointInstantUtc(
      endpoint("2026-03-08", "01:30", "America/New_York"),
    );
    const afterDst = toEndpointInstantUtc(
      endpoint("2026-03-08", "03:30", "America/New_York"),
    );

    expect(afterDst).toBeGreaterThan(beforeDst);
  });
});
