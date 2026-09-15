import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { MAPS_APPS } from "@/lib/maps/maps-app";

const updateUserPreferredMapsAppSchema = z.object({
  preferredMapsApp: z.enum(MAPS_APPS),
});

describe("updateUserPreferredMapsApp validation", () => {
  it("accepts canonical providers", () => {
    for (const provider of MAPS_APPS) {
      expect(
        updateUserPreferredMapsAppSchema.safeParse({ preferredMapsApp: provider })
          .success,
      ).toBe(true);
    }
  });

  it("rejects invalid provider", () => {
    expect(
      updateUserPreferredMapsAppSchema.safeParse({
        preferredMapsApp: "bing",
      }).success,
    ).toBe(false);
  });
});

describe("preferredMapsApp domain rules", () => {
  it("action uses requireUser only (no client userId)", () => {
    const source = readFileSync(
      join(
        process.cwd(),
        "src/features/maps/actions/update-user-preferred-maps-app.ts",
      ),
      "utf8",
    );
    expect(source).toContain("requireUser");
    expect(source).not.toMatch(/formData\.get\(["']userId["']\)/);
  });

  it("User model has preferredMapsApp without Trip field", () => {
    const userSource = readFileSync(
      join(process.cwd(), "src/models/User.ts"),
      "utf8",
    );
    expect(userSource).toContain("preferredMapsApp");
    const tripSource = readFileSync(
      join(process.cwd(), "src/models/Trip.ts"),
      "utf8",
    );
    expect(tripSource).not.toContain("preferredMapsApp");
  });
});
