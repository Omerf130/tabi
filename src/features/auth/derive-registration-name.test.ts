import { describe, expect, it } from "vitest";
import { deriveRegistrationNameFromEmail } from "./derive-registration-name";

describe("deriveRegistrationNameFromEmail", () => {
  it("derives a valid name from the email local part", () => {
    expect(deriveRegistrationNameFromEmail("alex.travel@example.com")).toBe("alex travel");
  });

  it("uses a fallback when the local part is too short", () => {
    expect(deriveRegistrationNameFromEmail("a@example.com")).toBe("Tabi Traveler");
  });
});
