import { describe, expect, it } from "vitest";
import { createHebrewTravelHubTranslators } from "@/features/i18n/test-translators";
import type { TransportRecord } from "@/features/transport/types";
import { buildTravelHubTransportRow } from "./build-travel-hub-transport-row";

const { t } = createHebrewTravelHubTranslators();
const tripId = "507f1f77bcf86cd799439011";

function record(id: string): TransportRecord {
  return {
    id,
    tripId,
    type: "train",
    departure: {
      locationName: "Tokyo",
      date: "2026-10-25",
      time: "09:00",
      timezone: "Asia/Tokyo",
    },
    arrival: {
      locationName: "Kyoto",
      date: "2026-10-25",
      time: "12:00",
      timezone: "Asia/Tokyo",
    },
    details: {},
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("buildTravelHubTransportRow", () => {
  it("shows empty copy when there are no transports", () => {
    const row = buildTravelHubTransportRow({ tripId, transports: [], t });

    expect(row.title).toBe("תחבורה");
    expect(row.href).toBe(`/app/trips/${tripId}/transport`);
    expect(row.countLabel).toBeNull();
    expect(row.detailLine).toBeNull();
    expect(row.emptyLine).toBe("עדיין לא נוספו נסיעות");
  });

  it("shows count only without a next-transport detail line", () => {
    const row = buildTravelHubTransportRow({
      tripId,
      transports: [record("a"), record("b"), record("c")],
      t,
    });

    expect(row.countLabel).toBe("3 קטעי תחבורה");
    expect(row.detailLine).toBeNull();
    expect(row.emptyLine).toBeNull();
  });
});
