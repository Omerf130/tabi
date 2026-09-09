import { describe, expect, it } from "vitest";
import {
  buildGoogleMapsCoordinatesUrl,
  buildGoogleMapsSearchUrl,
  buildTelHref,
} from "./google-maps-url";

describe("google maps url helpers", () => {
  it("builds search urls", () => {
    expect(buildGoogleMapsSearchUrl("Tokyo")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Tokyo",
    );
  });

  it("builds coordinate urls", () => {
    expect(buildGoogleMapsCoordinatesUrl(35.6762, 139.6503)).toContain("35.6762");
  });

  it("normalizes tel hrefs", () => {
    expect(buildTelHref("050-3816-2787")).toBe("tel:05038162787");
  });
});
