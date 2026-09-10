import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import { isAccommodationOccupiedOnDate } from "@/features/accommodations/accommodation-domain";
import { formatEntityLinkedCostDisplay } from "@/features/finance/entity-linked-cost-presentation";
import { buildItineraryDayHref } from "./routes";
import { resolveInitialItineraryDay } from "./resolve-initial-itinerary-day";
import { buildDayWorkspaceViewModel } from "./build-day-workspace";
import { shouldActivityUsePlaceImage } from "./should-activity-use-place-image";
import type { ActivityViewModel } from "./types";

const trip = { startDate: "2026-10-25", endDate: "2026-11-18" };

describe("itinerary redesign contracts", () => {
  it("resolves /itinerary to canonical day URLs by trip phase", () => {
    expect(resolveInitialItineraryDay(trip, null, "2026-10-01")).toBe("2026-10-25");
    expect(resolveInitialItineraryDay(trip, null, "2026-10-26")).toBe("2026-10-26");
    expect(resolveInitialItineraryDay(trip, null, "2026-12-01")).toBe("2026-10-25");
    expect(buildItineraryDayHref("trip-1", "2026-10-26")).toBe(
      "/app/trips/trip-1/itinerary/2026-10-26",
    );
  });

  it("preserves activity and transport chronology without duplication", () => {
    const activities: ActivityViewModel[] = [
      {
        id: "a1",
        date: "2026-10-26",
        title: "Morning",
        type: "attraction",
        typeLabel: "אטרקציה",
        order: 0,
        placeSource: "manual",
        startTime: "09:00",
        timeLabel: "09:00",
      },
      {
        id: "a2",
        date: "2026-10-26",
        title: "Evening",
        type: "restaurant",
        typeLabel: "מסעדה",
        order: 1,
        placeSource: "manual",
        startTime: "19:00",
        timeLabel: "19:00",
      },
    ];

    const items = mergeItineraryDayItems(activities, [
      {
        id: "t1",
        type: "train",
        typeLabel: "רכבת",
        routeLabel: "Tokyo → Kyoto",
        departureTime: "12:00",
        timeLabel: "12:00–14:00",
        detailHref: "/transport/t1",
      },
    ]);

    expect(items.map((item) => item.kind)).toEqual([
      "activity",
      "transport",
      "activity",
    ]);
    expect(items.filter((item) => item.kind === "transport")).toHaveLength(1);
  });

  it("renders linked original cost labels and omits missing costs", () => {
    expect(
      formatEntityLinkedCostDisplay({
        label: "¥4,200",
        amount: 4200,
        currency: "JPY",
        category: "activities",
      }),
    ).toBe("עלות: ¥4,200");

    const day = buildDayWorkspaceViewModel({
      tripId: "trip-1",
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      date: "2026-10-26",
      isOwner: true,
      activities: [
        {
          id: "a1",
          date: "2026-10-26",
          title: "Museum",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          placeSource: "manual",
          linkedCost: {
            label: "¥4,200",
            amount: 4200,
            currency: "JPY",
            category: "activities",
          },
        },
        {
          id: "a2",
          date: "2026-10-26",
          title: "Walk",
          type: "freeTime",
          typeLabel: "זמן חופשי",
          order: 1,
          placeSource: "manual",
        },
      ],
      transports: [],
      accommodations: [],
      documents: [],
      reminders: [],
    });

    expect(day.activities[0]?.linkedCost?.label).toBe("¥4,200");
    expect(day.activities[1]?.linkedCost).toBeUndefined();
  });

  it("preserves accommodation occupancy and day header context", () => {
    expect(isAccommodationOccupiedOnDate("2026-10-25", "2026-10-27", "2026-10-26")).toBe(
      true,
    );

    const day = buildDayWorkspaceViewModel({
      tripId: "trip-1",
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      date: "2026-10-26",
      isOwner: false,
      activities: [],
      transports: [],
      accommodations: [
        {
          id: "h1",
          tripId: "trip-1",
          placeSource: "manual",
          name: "Hotel Gracery Shinjuku",
          city: "Tokyo",
          checkInDate: "2026-10-25",
          checkOutDate: "2026-10-27",
          checkInLabel: "25 Oct",
          checkOutLabel: "27 Oct",
          dateRangeLabel: "25–27 Oct",
          nightCount: 2,
          usesGoogleAttribution: false,
        },
      ],
      documents: [
        {
          id: "d1",
          tripId: "trip-1",
          category: "ticket",
          categoryLabel: "כרטיס",
          title: "Train ticket",
          fileContentType: "application/pdf",
          fileTypeLabel: "PDF",
          isPdf: true,
          isImage: false,
          fileHref: "/file/d1",
          downloadHref: "/file/d1?download=1",
          detailHref: "/documents/d1",
          contextLink: {
            type: "activity",
            activityId: "a1",
            title: "Museum",
            date: "2026-10-26",
            activityType: "אטרקציה",
          },
          createdAtLabel: "1 Jan 2026",
          sortDate: "2026-10-26",
          showInEmergency: false,
        },
      ],
      reminders: [
        {
          id: "r1",
          date: "2026-10-26",
          time: "08:00",
          text: "Pack",
          isCompleted: false,
          dateLabel: "26 Oct",
          displayLine: "08:00 · Pack",
        },
      ],
      dayHeader: {
        accommodationContext: "הלילה ישנים ב־Hotel Gracery Shinjuku",
        locationLabel: "Tokyo",
      },
    });

    expect(day.accommodations).toHaveLength(1);
    expect(day.documents).toHaveLength(1);
    expect(day.incompleteReminders).toHaveLength(1);
    expect(day.dayHeader.accommodationContext).toContain("Hotel Gracery Shinjuku");
    expect(day.isOwner).toBe(false);
  });

  it("limits place imagery to eligible activities and not transport", () => {
    expect(
      shouldActivityUsePlaceImage({
        type: "attraction",
        placeSource: "google",
        googlePlaceId: "p1",
      }),
    ).toBe(true);

    expect(
      shouldActivityUsePlaceImage({
        type: "transport",
        placeSource: "google",
        googlePlaceId: "p1",
      }),
    ).toBe(false);
  });

  it("does not introduce itinerary map dependencies", () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const files = [
      "features/itinerary/DayPageContent.tsx",
      "features/itinerary/DayPageShell.client.tsx",
      "features/itinerary/DayTimeline.client.tsx",
      "features/itinerary/ActivityRow.tsx",
      "features/itinerary/TransportItineraryRow.tsx",
      "features/itinerary/ItineraryExperience.module.scss",
    ];

    for (const relativePath of files) {
      const source = readFileSync(join(root, relativePath), "utf8").toLowerCase();
      expect(source).not.toMatch(/google\.maps|@react-google-maps|mapbox|leaflet/);
      expect(source).not.toMatch(/itinerarymap|map preview|view all day on map/);
    }
  });
});
