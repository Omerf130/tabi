import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { getTransportFilterEmptyMessageKey } from "./transport-labels";
import { filterTransportList } from "./filter-transport-list";

describe("filterTransportList", () => {
  const t = createAppTranslator("Transport", "he");

  it("returns localized empty messages by filter", () => {
    expect(t(getTransportFilterEmptyMessageKey("all"))).toBe("אין תחבורה");
    expect(t(getTransportFilterEmptyMessageKey("flight"))).toBe(
      "אין עדיין טיסות בטיול הזה",
    );
  });

  it("filters transport cards by type", () => {
    const transports = [
      { id: "1", type: "flight" as const },
      { id: "2", type: "train" as const },
      { id: "3", type: "bus" as const },
    ] as unknown as Parameters<typeof filterTransportList>[0];

    expect(filterTransportList(transports, "flight")).toHaveLength(1);
    expect(filterTransportList(transports, "other")).toHaveLength(1);
  });
});
