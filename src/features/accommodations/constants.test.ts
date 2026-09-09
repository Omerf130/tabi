import { describe, expect, it } from "vitest";
import {
  ACCOMMODATION_MESSAGES,
  formatAccommodationDeleteConfirm,
} from "./constants";

describe("accommodation constants", () => {
  it("formats delete confirmation with hotel-booking disclaimer", () => {
    expect(formatAccommodationDeleteConfirm()).toBe(
      `${ACCOMMODATION_MESSAGES.deleteConfirm}\n\n${ACCOMMODATION_MESSAGES.deleteConfirmDetail}`,
    );
  });
});
