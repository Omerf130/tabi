import { describe, expect, it } from "vitest";
import { resolveDocumentDayRelevance } from "./day-document-relevance";

describe("resolveDocumentDayRelevance", () => {
  it("includes activity-linked documents only on the activity date", () => {
    expect(
      resolveDocumentDayRelevance(
        {
          contextLink: {
            type: "activity",
            activityId: "a1",
            title: "Museum",
            date: "2026-10-26",
            activityType: "attraction",
          },
        },
        "2026-10-26",
      ),
    ).toBe(true);
    expect(
      resolveDocumentDayRelevance(
        {
          contextLink: {
            type: "activity",
            activityId: "a1",
            title: "Museum",
            date: "2026-10-26",
            activityType: "attraction",
          },
        },
        "2026-10-27",
      ),
    ).toBe(false);
  });

  it("includes transport-linked documents only on departure date", () => {
    expect(
      resolveDocumentDayRelevance(
        {
          contextLink: {
            type: "transport",
            transportId: "t1",
            title: "NRT → Kyoto",
          },
          transportDepartureDate: "2026-10-28",
        },
        "2026-10-28",
      ),
    ).toBe(true);
    expect(
      resolveDocumentDayRelevance(
        {
          contextLink: {
            type: "transport",
            transportId: "t1",
            title: "NRT → Kyoto",
          },
          transportDepartureDate: "2026-10-28",
        },
        "2026-10-27",
      ),
    ).toBe(false);
  });

  it("includes accommodation-linked documents using occupancy semantics", () => {
    const document = {
      contextLink: {
        type: "accommodation" as const,
        accommodationId: "h1",
        title: "Hotel",
      },
      accommodationCheckIn: "2026-10-25",
      accommodationCheckOut: "2026-10-29",
    };

    expect(resolveDocumentDayRelevance(document, "2026-10-25")).toBe(true);
    expect(resolveDocumentDayRelevance(document, "2026-10-28")).toBe(true);
    expect(resolveDocumentDayRelevance(document, "2026-10-29")).toBe(false);
  });

  it("excludes standalone documents without a context link", () => {
    expect(resolveDocumentDayRelevance({}, "2026-10-26")).toBe(false);
  });

  it("excludes stale activity links without matching date context", () => {
    expect(
      resolveDocumentDayRelevance(
        {
          contextLink: {
            type: "activity",
            activityId: "missing",
            title: "Missing",
            date: "2026-10-26",
            activityType: "other",
          },
        },
        "2026-10-27",
      ),
    ).toBe(false);
  });
});
