import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("Product Hardening 1 — trip shell safe-area contract", () => {
  it("TripShellLayout.contentArea owns mobile --safe-top and clears it on desktop", () => {
    const shell = read("features/app-shell/TripShellLayout.module.scss");
    const mobileContentArea = shell.split("@media (min-width: 1024px)")[0] ?? shell;
    expect(mobileContentArea).toContain(".contentArea");
    expect(mobileContentArea).toContain("padding-top: var(--safe-top)");
    expect(shell).toMatch(
      /@media\s*\(\s*min-width:\s*1024px\s*\)[\s\S]*\.contentArea[\s\S]*padding-top:\s*0/,
    );
  });

  it("TripShellLayout.contentArea keeps BottomNav + safe-bottom scroll clearance", () => {
    const shell = read("features/app-shell/TripShellLayout.module.scss");
    expect(shell).toContain("var(--size-bottom-nav)");
    expect(shell).toContain("var(--safe-bottom)");
  });

  it("AppHeader inside trip shell does not double-count --safe-top on mobile", () => {
    const header = read("components/ui/AppHeader/AppHeader.module.scss");
    expect(header).toContain("padding-top: calc(var(--space-2) + var(--safe-top))");
    expect(header).toMatch(
      /@media\s*\(\s*max-width:\s*1023px\s*\)[\s\S]*:global\(\[data-trip-theme\]\)\s*\.header[\s\S]*padding-top:\s*var\(--space-2\)/,
    );
  });

  it("AppHeader default rule still applies safe-top for headers outside trip shell", () => {
    const header = read("components/ui/AppHeader/AppHeader.module.scss");
    const defaultBlock = header.split("@media (max-width: 1023px)")[0] ?? header;
    expect(defaultBlock).toContain("padding-top: calc(var(--space-2) + var(--safe-top))");
  });

  it("Trip Home hero uses coordinated immersive safe-top bleed", () => {
    const home = read("features/trip-home/TripHomeContent.module.scss");
    const heroBlock = home.split(".hero[data-phase")[0] ?? home;
    expect(heroBlock).toContain("margin-top: calc(-1 * var(--safe-top))");
    expect(heroBlock).toContain("padding-top: var(--safe-top)");
    expect(heroBlock).not.toContain("margin-top: var(--space-3)");
  });

  it("Travel Hub hero uses coordinated immersive safe-top bleed on mobile", () => {
    const hub = read("features/travel-hub/TravelHub.module.scss");
    const mobileHub = hub.split("@media (min-width: 1024px)")[0] ?? hub;
    expect(mobileHub).toContain("margin-top: calc(-1 * var(--safe-top))");
    expect(mobileHub).toContain("padding-top: var(--safe-top)");
    expect(hub).toMatch(
      /@media\s*\(\s*min-width:\s*1024px\s*\)[\s\S]*\.hero[\s\S]*margin-top:\s*0[\s\S]*padding-top:\s*0/,
    );
  });

  it("Travel Hub hub cancels AppPage top pad without pulling through shell safe-top", () => {
    const hub = read("features/travel-hub/TravelHub.module.scss");
    expect(hub).toContain("margin-top: calc(-1 * var(--space-5))");
    expect(hub).not.toContain("margin-top: calc(-1 * var(--space-5) - var(--safe-top))");
  });

  it("BottomNav still owns --safe-bottom", () => {
    const nav = read("components/ui/BottomNav/BottomNav.module.scss");
    expect(nav).toContain("padding-bottom: calc(var(--space-2) + var(--safe-bottom))");
  });

  it("AppPage flushTop only removes page spacing, not shell safe-top", () => {
    const page = read("features/app-shell/AppPage.module.scss");
    expect(page).toMatch(/\[data-flush-top="true"\][\s\S]*padding-top:\s*0/);
    expect(page).toMatch(/\[data-flush-top="true"\][\s\S]*padding-bottom:\s*0/);
    expect(page).not.toContain("--safe-top");

    const shell = read("features/app-shell/TripShellLayout.module.scss");
    expect(shell).toContain("padding-top: var(--safe-top)");

    const homePage = readFileSync(
      join(process.cwd(), "src/app/app/trips/[tripId]/page.tsx"),
      "utf8",
    );
    expect(homePage).toContain("flushTop");
  });

  it("Documents wallet chrome counts --safe-top once for viewport chrome stack", () => {
    const docs = read("features/documents/DocumentsPage.module.scss");
    const mobileBlock = docs.split("@media (min-width: 1024px)")[0] ?? docs;
    const safeTopMatches = mobileBlock.match(/var\(--safe-top\)/g) ?? [];
    expect(safeTopMatches).toHaveLength(1);
  });
});
