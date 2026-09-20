import { describe, expect, it } from "vitest";
import { toTripListItem, toTripWorkspace } from "./public-trip";

describe("public trip DTOs", () => {
  const trip = {
    _id: { toString: () => "trip-1" },
    name: "ירח דבש",
    startDate: "2026-10-25",
    endDate: "2026-11-18",
  };

  it("retains exact date strings in list items", () => {
    const item = toTripListItem(trip, "owner", "2026-10-24");
    expect(item.startDate).toBe("2026-10-25");
    expect(item.endDate).toBe("2026-11-18");
    expect(item.phase).toBe("upcoming");
    expect(item).not.toHaveProperty("createdBy");
  });

  it("retains exact date strings in workspace DTO", () => {
    const workspace = toTripWorkspace(trip, "owner", "Asia/Tokyo");
    expect(workspace).toEqual({
      id: "trip-1",
      name: "ירח דבש",
      description: "",
      startDate: "2026-10-25",
      endDate: "2026-11-18",
      role: "owner",
      coverImage: undefined,
      coverVisualKey: null,
      themeKey: "default",
      destinationCalendarTimeZone: "Asia/Tokyo",
      destination: undefined,
      travelLanguageCode: null,
      effectiveTravelLanguageCode: null,
      travelLanguageSource: "unknown",
      alternativeTravelLanguageCodes: [],
    });
  });

  it("resolves invalid persisted themeKey to default in workspace DTO", () => {
    const workspace = toTripWorkspace(
      {
        ...trip,
        themeKey: "unknown-theme",
      },
      "owner",
      "UTC",
    );
    expect(workspace.themeKey).toBe("default");
  });
});
