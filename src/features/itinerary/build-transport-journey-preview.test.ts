import { describe, expect, it } from "vitest";
import { buildTransportJourneyPreview } from "./build-transport-journey-preview";

describe("buildTransportJourneyPreview", () => {
  it("returns null until both endpoints exist", () => {
    expect(
      buildTransportJourneyPreview({
        departureLocationName: "Tokyo",
      }),
    ).toBeNull();
  });
});
