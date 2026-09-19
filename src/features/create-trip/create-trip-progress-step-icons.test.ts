import { describe, expect, it } from "vitest";
import {
  CREATE_TRIP_PROGRESS_STEP_ICONS,
  getCreateTripProgressStepIcon,
} from "./create-trip-progress-step-icons";

describe("create trip progress step icons", () => {
  it("exposes exactly five icons for progress steps", () => {
    expect(CREATE_TRIP_PROGRESS_STEP_ICONS).toHaveLength(5);
  });

  it("clamps step index when resolving icon", () => {
    expect(getCreateTripProgressStepIcon(-1)).toBe(
      CREATE_TRIP_PROGRESS_STEP_ICONS[0],
    );
    expect(getCreateTripProgressStepIcon(2)).toBe(
      CREATE_TRIP_PROGRESS_STEP_ICONS[2],
    );
    expect(getCreateTripProgressStepIcon(10)).toBe(
      CREATE_TRIP_PROGRESS_STEP_ICONS[4],
    );
  });
});
