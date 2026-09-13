import { describe, expect, it } from "vitest";
import { createHebrewTransportTranslator } from "@/features/i18n/test-translators";
import {
  buildTransportContextLabel,
  selectNextUpcomingTransport,
  selectTransportsDepartingOnDate,
} from "./select-transport-context";
import type { TransportRecord } from "./types";

const t = createHebrewTransportTranslator();

function record(
  id: string,
  date: string,
  time: string,
  type: TransportRecord["type"] = "train",
): TransportRecord {
  return {
    id,
    tripId: "trip",
    type,
    departure: {
      locationName: "Tokyo",
      date,
      time,
      timezone: "Asia/Tokyo",
    },
    arrival: {
      locationName: "Kyoto",
      date,
      time: "12:00",
      timezone: "Asia/Tokyo",
    },
    details: {},
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("select transport context", () => {
  it("selects transports departing on a date in time order", () => {
    const items = selectTransportsDepartingOnDate(
      [record("b", "2026-10-25", "14:00"), record("a", "2026-10-25", "09:00")],
      "2026-10-25",
      t,
    );

    expect(items.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("selects next upcoming transport from date and optional time", () => {
    const transports = [
      record("past", "2026-10-24", "10:00"),
      record("same-day-later", "2026-10-25", "15:00"),
      record("future", "2026-10-26", "08:00"),
    ];

    expect(selectNextUpcomingTransport(transports, "2026-10-25", t, "14:00")?.id).toBe(
      "same-day-later",
    );
    expect(selectNextUpcomingTransport(transports, "2026-10-25", t)?.id).toBe("future");
    expect(selectNextUpcomingTransport(transports, "2026-10-26", t, "07:00")?.id).toBe("future");
    expect(selectNextUpcomingTransport(transports, "2026-10-26", t)).toBeNull();
  });

  it("builds a Hebrew-friendly context label", () => {
    const label = buildTransportContextLabel(
      record("t1", "2026-10-25", "09:15", "flight"),
      t,
    );
    expect(label).toContain("טיסה");
    expect(label).toContain("09:15");
    expect(label).toContain("Tokyo → Kyoto");
  });
});
