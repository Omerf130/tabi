import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildTransportNewHref } from "./constants";
import { resolveTransportVisualSrc } from "./resolve-transport-visual-src";
import { toTransportCardViewModel } from "./to-transport-view-model";
import { TRANSPORT_TYPES } from "./transport-types";
import type { TransportRecord } from "./types";

const featureRoot = dirname(fileURLToPath(import.meta.url));
const tripId = "507f1f77bcf86cd799439011";

const baseTransportRecord: TransportRecord = {
  id: "transport-1",
  tripId,
  type: "flight",
  departure: {
    locationName: "Tel Aviv",
    locationCode: "TLV",
    date: "2026-10-24",
    time: "08:00",
    timezone: "Asia/Jerusalem",
  },
  arrival: {
    locationName: "Tokyo",
    locationCode: "NRT",
    date: "2026-10-25",
    time: "06:30",
    timezone: "Asia/Tokyo",
  },
  details: {
    airline: "ANA",
    flightNumber: "NH838",
  },
  createdAt: "2026-10-01T00:00:00.000Z",
};

describe("transport page presentation", () => {
  it("derives list fields from real transport data", () => {
    const card = toTransportCardViewModel(tripId, baseTransportRecord);

    expect(card.listTitle).toBe("טיסה לTokyo");
    expect(card.departureDate).toBe("2026-10-24");
    expect(card.departureTime).toBe("08:00");
    expect(card.visualSrc).toBe("/transport-visuals/flight.png");
    expect(card.detailHref).toBe(`/app/trips/${tripId}/transport/${baseTransportRecord.id}`);
  });

  it("uses only local transport visuals", () => {
    for (const type of TRANSPORT_TYPES) {
      expect(resolveTransportVisualSrc(type)).toMatch(/^\/transport-visuals\/.+\.png$/);
    }
  });

  it("does not show fake confirmation status in list UI", () => {
    const rowSource = readFileSync(join(featureRoot, "TransportListRow.tsx"), "utf8");
    const listSource = readFileSync(
      join(featureRoot, "TransportListView.client.tsx"),
      "utf8",
    );

    expect(rowSource).not.toMatch(/Confirmed|אושר|סטטוס/i);
    expect(listSource).not.toMatch(/Confirmed|אושר|סטטוס/i);
  });

  it("wraps route labels for bidi isolation", () => {
    const rowSource = readFileSync(join(featureRoot, "TransportListRow.tsx"), "utf8");

    expect(rowSource).toContain('dir="ltr"');
    expect(rowSource).toContain("routeLabel");
  });

  it("wires filter module and compact list view", () => {
    const listSource = readFileSync(
      join(featureRoot, "TransportListView.client.tsx"),
      "utf8",
    );
    const contentSource = readFileSync(join(featureRoot, "TransportPageContent.tsx"), "utf8");

    expect(listSource).toContain("filterTransportList");
    expect(listSource).toContain("TransportListRow");
    expect(contentSource).toContain("flattenTransportCards");
    expect(contentSource).toContain("TransportListView");
    expect(contentSource).not.toContain("הוספת תחבורה");
  });

  it("uses canonical create hrefs in owner add menu", () => {
    const menuSource = readFileSync(
      join(featureRoot, "TransportAddMenu.client.tsx"),
      "utf8",
    );

    expect(menuSource).toContain("buildTransportNewHref");
    expect(menuSource).toContain("getAddTransportTypeLabel");
    expect(buildTransportNewHref(tripId, "flight")).toBe(
      `/app/trips/${tripId}/transport/new?type=flight`,
    );
  });

  it("keeps embedded manage mode add menu at top of content", () => {
    const contentSource = readFileSync(join(featureRoot, "TransportPageContent.tsx"), "utf8");

    expect(contentSource).toContain('variant="embedded"');
    expect(contentSource).toContain("embeddedActions");
  });
});
