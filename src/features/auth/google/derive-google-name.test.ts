import { describe, expect, it } from "vitest";
import { deriveNameFromEmail, resolveGoogleUserName } from "./derive-google-name";

describe("resolveGoogleUserName", () => {
  it("uses a valid Google profile name", () => {
    expect(resolveGoogleUserName("  Ada Lovelace  ", "ada@example.com")).toBe(
      "Ada Lovelace",
    );
  });

  it("derives a fallback from email when Google name is missing", () => {
    expect(resolveGoogleUserName(undefined, "ada.lovelace@example.com")).toBe(
      "ada lovelace",
    );
  });

  it("derives a fallback when Google name is too short", () => {
    expect(resolveGoogleUserName("A", "a@example.com")).toBe("a User");
  });
});

describe("deriveNameFromEmail", () => {
  it("keeps names within model limits", () => {
    const longLocal = "a".repeat(100);
    expect(deriveNameFromEmail(`${longLocal}@example.com`).length).toBeLessThanOrEqual(
      80,
    );
  });
});
