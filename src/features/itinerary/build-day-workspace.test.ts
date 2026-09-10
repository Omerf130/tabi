import { describe, expect, it } from "vitest";
import { mergeItineraryDayItems } from "@/features/transport/merge-itinerary-day-items";
import { buildDayWorkspaceViewModel } from "./build-day-workspace";
import type { ActivityViewModel } from "./types";

describe("buildDayWorkspaceViewModel", () => {
  const activities: ActivityViewModel[] = [
    {
      id: "a1",
      date: "2026-10-26",
      title: "Late activity",
      type: "other",
      typeLabel: "אחר",
      order: 1,
      placeSource: "manual",
      startTime: "18:00",
    },
    {
      id: "a2",
      date: "2026-10-26",
      title: "Morning activity",
      type: "attraction",
      typeLabel: "אטרקציה",
      order: 0,
      placeSource: "manual",
      startTime: "10:00",
    },
  ];

  it("scopes reminders and linked documents to the selected day", () => {
    const day = buildDayWorkspaceViewModel({
      tripId: "trip-1",
      startDate: "2026-10-25",
      endDate: "2026-10-27",
      date: "2026-10-26",
      isOwner: true,
      activities,
      transports: [
        {
          id: "t1",
          type: "train",
          typeLabel: "רכבת",
          routeLabel: "Tokyo → Kyoto",
          departureTime: "14:00",
          timeLabel: "14:00–16:00",
          detailHref: "/transport/t1",
        },
      ],
      accommodations: [
        {
          id: "h1",
          tripId: "trip-1",
          placeSource: "manual",
          name: "Hotel",
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
            type: "transport",
            transportId: "t1",
            title: "Tokyo → Kyoto",
          },
          transportDepartureDate: "2026-10-26",
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
        {
          id: "r2",
          date: "2026-10-26",
          time: "09:00",
          text: "Done",
          isCompleted: true,
          dateLabel: "26 Oct",
          displayLine: "09:00 · Done",
        },
      ],
    });

    expect(day.incompleteReminders).toHaveLength(1);
    expect(day.completedReminders).toHaveLength(1);
    expect(day.documents).toHaveLength(1);
    expect(day.accommodations).toHaveLength(1);
    expect(day.dayHeader.dayNumber).toBe(2);
    expect(day.dayHeader.weekdayLabel).toBeTruthy();
  });

  it("preserves mergeItineraryDayItems transport insertion behavior", () => {
    const items = mergeItineraryDayItems(
      [
        {
          id: "a2",
          date: "2026-10-26",
          title: "Morning activity",
          type: "attraction",
          typeLabel: "אטרקציה",
          order: 0,
          placeSource: "manual",
          startTime: "10:00",
        },
        {
          id: "a1",
          date: "2026-10-26",
          title: "Late activity",
          type: "other",
          typeLabel: "אחר",
          order: 1,
          placeSource: "manual",
          startTime: "18:00",
        },
      ],
      [
        {
          id: "t1",
          type: "train",
          typeLabel: "רכבת",
          routeLabel: "Tokyo → Kyoto",
          departureTime: "12:00",
          timeLabel: "12:00–14:00",
          detailHref: "/transport/t1",
        },
      ],
    );

    expect(items.map((item) => item.kind)).toEqual([
      "activity",
      "transport",
      "activity",
    ]);
  });
});
