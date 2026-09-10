import { describe, expect, it } from "vitest";
import type { AccommodationViewModel } from "@/features/accommodations/types";
import type { ResolvedTravelDocumentViewModel } from "@/features/documents/types";
import type { TransportItineraryItemViewModel } from "@/features/transport/types";
import { buildItineraryOverviewSummaries } from "./build-itinerary-overview";
import type { ActivityViewModel } from "./types";

const tripId = "trip-1";
const startDate = "2026-10-25";
const endDate = "2026-10-27";

const activities: ActivityViewModel[] = [
  {
    id: "a1",
    date: "2026-10-26",
    title: "Museum",
    type: "attraction",
    typeLabel: "אטרקציה",
    order: 0,
    placeSource: "manual",
  },
];

const transportsByDate = new Map<string, TransportItineraryItemViewModel[]>([
  [
    "2026-10-27",
    [
      {
        id: "t1",
        type: "train",
        typeLabel: "רכבת",
        routeLabel: "Tokyo → Kyoto",
        departureTime: "09:00",
        timeLabel: "09:00–11:00",
        detailHref: "/transport/t1",
        metaLabel: "Shinkansen",
      },
    ],
  ],
]);

const accommodations: AccommodationViewModel[] = [
  {
    id: "h1",
    tripId,
    placeSource: "manual",
    name: "Hotel Alpha",
    city: "Tokyo",
    checkInDate: "2026-10-25",
    checkOutDate: "2026-10-27",
    checkInLabel: "25 Oct",
    checkOutLabel: "27 Oct",
    dateRangeLabel: "25–27 Oct",
    nightCount: 2,
    usesGoogleAttribution: false,
  },
];

const documents: ResolvedTravelDocumentViewModel[] = [
  {
    id: "d1",
    tripId,
    category: "ticket",
    categoryLabel: "כרטיס",
    title: "Museum ticket",
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
  {
    id: "d2",
    tripId,
    category: "other",
    categoryLabel: "אחר",
    title: "Standalone",
    fileContentType: "application/pdf",
    fileTypeLabel: "PDF",
    isPdf: true,
    isImage: false,
    fileHref: "/file/d2",
    downloadHref: "/file/d2?download=1",
    detailHref: "/documents/d2",
    createdAtLabel: "1 Jan 2026",
    sortDate: "2026-10-20",
    showInEmergency: false,
  },
];

describe("buildItineraryOverviewSummaries", () => {
  it("derives compact summaries for every trip day without per-day queries", () => {
    const summaries = buildItineraryOverviewSummaries({
      tripId,
      startDate,
      endDate,
      activities,
      transportsByDate,
      accommodations,
      documents,
      incompleteReminderDates: new Set(["2026-10-26"]),
      todayJapan: "2026-10-26",
    });

    expect(summaries).toHaveLength(3);
    expect(summaries[0]?.href).toBe("/app/trips/trip-1/itinerary/2026-10-25");
    expect(summaries[0]?.accommodationLabel).toBe("Hotel Alpha");
    expect(summaries[1]?.activityCount).toBe(1);
    expect(summaries[1]?.documentCount).toBe(1);
    expect(summaries[1]?.hasIncompleteReminder).toBe(true);
    expect(summaries[1]?.temporalState).toBe("today");
    expect(summaries[2]?.transportCount).toBe(1);
    expect(summaries[2]?.accommodationLabel).toBeUndefined();
  });

  it("counts accommodation occupancy on check-in but not check-out day", () => {
    const summaries = buildItineraryOverviewSummaries({
      tripId,
      startDate,
      endDate,
      activities: [],
      transportsByDate: new Map(),
      accommodations,
      documents: [],
      incompleteReminderDates: new Set(),
    });

    expect(summaries[0]?.accommodationLabel).toBe("Hotel Alpha");
    expect(summaries[1]?.accommodationLabel).toBe("Hotel Alpha");
    expect(summaries[2]?.accommodationLabel).toBeUndefined();
  });
});
