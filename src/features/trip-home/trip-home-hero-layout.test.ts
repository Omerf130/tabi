import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function readHomeScss(): string {
  return readFileSync(
    join(process.cwd(), "src/features/trip-home/TripHomeContent.module.scss"),
    "utf8",
  );
}

describe("Trip Home hero layout", () => {
  it("uses taller mobile min-height without extra top gap", () => {
    const home = readHomeScss();
    expect(home).toContain(
      "--home-hero-min: clamp(9.125rem, 42.5vw, 11.875rem)",
    );
    const heroBlock = home.split(".hero[data-phase")[0] ?? home;
    expect(heroBlock).toContain("margin-top: calc(-1 * var(--safe-top))");
    expect(heroBlock).not.toContain("margin-top: var(--space-3)");
    expect(heroBlock).not.toMatch(/margin-top:[\s\S]*--space-3/);
  });

  it("keeps cover fill and generic object-position on hero image", () => {
    const home = readHomeScss();
    expect(home).toContain("object-fit: cover");
    expect(home).toContain("object-position: center 66%");
  });

  it("leaves desktop hero min-heights unchanged", () => {
    const home = readHomeScss();
    const desktop = home.split("@media (min-width: 1024px)")[1] ?? "";
    expect(desktop).toContain("min-height: 22rem");
    expect(desktop).toContain("margin-top: 0");
    expect(desktop).not.toContain("margin-top: var(--space-3)");
  });
});
