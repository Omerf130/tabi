import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { getAccommodationFilterEmptyMessageKey } from "./accommodation-labels";
import { filterAccommodationList } from "./filter-accommodation-list";

describe("filterAccommodationList", () => {
  const t = createAppTranslator("Accommodation", "he");

  it("returns localized empty messages by filter", () => {
    expect(t(getAccommodationFilterEmptyMessageKey("all"))).toBe("אין מקומות לינה");
    expect(t(getAccommodationFilterEmptyMessageKey("upcoming"))).toBe(
      "אין מקומות לינה קרובים",
    );
    expect(t(getAccommodationFilterEmptyMessageKey("past"))).toBe("אין מקומות לינה קודמים");
  });

  it("filters upcoming and past stays", () => {
    const items = [
      { id: "1", checkOutDate: "2026-04-10" },
      { id: "2", checkOutDate: "2026-04-01" },
    ] as unknown as Parameters<typeof filterAccommodationList>[0];

    expect(filterAccommodationList(items, "upcoming", "2026-04-05")).toHaveLength(1);
    expect(filterAccommodationList(items, "past", "2026-04-05")).toHaveLength(1);
  });
});
