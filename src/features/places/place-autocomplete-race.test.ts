import { describe, expect, it } from "vitest";
import { shouldApplyAutocompleteResponse } from "./place-autocomplete-race";

describe("shouldApplyAutocompleteResponse", () => {
  it("accepts the latest request id", () => {
    expect(shouldApplyAutocompleteResponse(3, 3)).toBe(true);
  });

  it("rejects stale responses", () => {
    expect(shouldApplyAutocompleteResponse(1, 3)).toBe(false);
    expect(shouldApplyAutocompleteResponse(2, 3)).toBe(false);
  });
});
