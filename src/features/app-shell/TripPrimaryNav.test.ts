import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NAV_SECTIONS } from "./navigation";

describe("TripPrimaryNav", () => {
  it("uses the shared five-section navigation for bottom and rail variants", () => {
    const source = readFileSync(
      join(process.cwd(), "src/features/app-shell/TripPrimaryNav.tsx"),
      "utf8",
    );

    expect(source).toContain('variant: "bottom" | "rail"');
    expect(source).toContain("NAV_SECTIONS");
    expect(source).toContain('useTranslations("Navigation")');
    expect(source).toContain("IconGear");
    expect(source).not.toContain("IconMemories");
    expect(NAV_SECTIONS).toEqual([
      "home",
      "itinerary",
      "documents",
      "settings",
      "more",
    ]);
  });
});
