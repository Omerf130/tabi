import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { buildAccommodationListItem } from "./build-accommodation-list-item";

const t = createAppTranslator("Accommodation", "he");
import type { AccommodationViewModel } from "./types";

const featureRoot = dirname(fileURLToPath(import.meta.url));
const tripId = "507f1f77bcf86cd799439011";

const baseAccommodation: AccommodationViewModel = {
  id: "acc-1",
  tripId,
  placeSource: "google",
  googlePlaceId: "place-1",
  name: "Hotel Granvia Kyoto",
  city: "Kyoto",
  checkInDate: "2026-10-24",
  checkOutDate: "2026-10-27",
  checkInLabel: "24 Oct 2026",
  checkOutLabel: "27 Oct 2026",
  dateRangeLabel: "24 Oct 2026 – 27 Oct 2026",
  nightCount: 3,
  usesGoogleAttribution: true,
};

describe("accommodation page presentation", () => {
  it("derives list item fields from real accommodation data", () => {
    const item = buildAccommodationListItem(
      tripId,
      baseAccommodation,
      "2026-10-25",
      t,
      {
        hasPhoto: true,
        photoHref: `/app/trips/${tripId}/accommodations/acc-1/photo`,
        authorAttributions: [],
      },
    );

    expect(item.locationLabel).toBe("Kyoto");
    expect(item.dateRangeCompactLabel).toBe("24.10 – 27.10");
    expect(item.nightCountLabel).toBe("3 לילות");
    expect(item.detailHref).toBe(`/app/trips/${tripId}/accommodations/acc-1`);
    expect(item.isCurrentStay).toBe(true);
  });

  it("does not show fake confirmation status in list UI", () => {
    const rowSource = readFileSync(
      join(featureRoot, "AccommodationListRow.tsx"),
      "utf8",
    );
    const listSource = readFileSync(
      join(featureRoot, "AccommodationListView.client.tsx"),
      "utf8",
    );

    expect(rowSource).not.toMatch(/Confirmed|אושר|סטטוס/i);
    expect(listSource).not.toMatch(/Confirmed|אושר|סטטוס/i);
  });

  it("collapses image column when no photo is available", () => {
    const rowSource = readFileSync(
      join(featureRoot, "AccommodationListRow.tsx"),
      "utf8",
    );

    expect(rowSource).toContain("hasPhoto");
    expect(rowSource).toContain("rowLinkNoPhoto");
    expect(rowSource).not.toContain("PlaceImage");
    expect(rowSource).not.toContain("fallback");
  });

  it("wires filter module and compact list view", () => {
    const listSource = readFileSync(
      join(featureRoot, "AccommodationListView.client.tsx"),
      "utf8",
    );
    const contentSource = readFileSync(
      join(featureRoot, "AccommodationsPageContent.tsx"),
      "utf8",
    );

    expect(listSource).toContain("filterAccommodationList");
    expect(listSource).toContain("AccommodationListRow");
    expect(contentSource).toContain("AccommodationListView");
    expect(contentSource).not.toContain("ניהול, עריכה ומחיקה");
  });

  it("opens global quick add for owner add button", () => {
    const addSource = readFileSync(
      join(featureRoot, "AccommodationAddButton.client.tsx"),
      "utf8",
    );

    expect(addSource).toContain("useQuickAdd");
    expect(addSource).toContain('action: "accommodation"');
    expect(addSource).not.toContain("getAccommodationsSettingsHref");
  });

  it("uses bidi-safe title rendering", () => {
    const rowSource = readFileSync(
      join(featureRoot, "AccommodationListRow.tsx"),
      "utf8",
    );

    expect(rowSource).toContain('dir="auto"');
  });
});
