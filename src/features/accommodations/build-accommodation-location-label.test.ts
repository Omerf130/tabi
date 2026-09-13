import { describe, expect, it } from "vitest";
import { buildAccommodationLocationLabel } from "./build-accommodation-location-label";

describe("buildAccommodationLocationLabel", () => {
  it("prefers city over address fields", () => {
    expect(
      buildAccommodationLocationLabel({
        city: "Kyoto",
        addressEnglish: "123 Street",
      }),
    ).toBe("Kyoto");
  });

  it("falls back to saved address when city is missing", () => {
    expect(
      buildAccommodationLocationLabel({
        addressEnglish: "Hotel Granvia, Kyoto Station",
      }),
    ).toBe("Hotel Granvia, Kyoto Station");
  });

  it("uses Japanese address as last fallback", () => {
    expect(
      buildAccommodationLocationLabel({
        addressJapanese: "京都駅前",
      }),
    ).toBe("京都駅前");
  });
});
