import { describe, expect, it } from "vitest";
import { CREATE_TRIP_PATH } from "./constants";

describe("My Trips routes", () => {
  it("uses the dedicated create trip route for empty-state CTA", () => {
    expect(CREATE_TRIP_PATH).toBe("/app/trips/new");
  });
});
