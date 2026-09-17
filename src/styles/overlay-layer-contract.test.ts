import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getQuickAddOverlayOpenSnapshot,
  setQuickAddOverlayOpen,
  subscribeQuickAddOverlayOpen,
} from "@/features/quick-add/quick-add-overlay-open";
import { shouldRenderSwUpdatePrompt } from "@/features/pwa/sw-update-state";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

const LAYER_TOKEN_NAMES = [
  "--layer-base",
  "--layer-sticky",
  "--layer-nav",
  "--layer-popover",
  "--layer-trip-overlay",
  "--layer-system",
] as const;

function parseLayerValues(tokensSource: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const name of LAYER_TOKEN_NAMES) {
    const match = tokensSource.match(
      new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*(\\d+)\\s*;`),
    );
    if (!match) {
      throw new Error(`Missing ${name} in tokens.scss`);
    }
    map.set(name, Number.parseInt(match[1]!, 10));
  }
  return map;
}

describe("overlay layer contract (H3A)", () => {
  it("defines global layer tokens with ascending semantic order", () => {
    const tokens = read("styles/tokens.scss");
    for (const name of LAYER_TOKEN_NAMES) {
      expect(tokens).toContain(name);
    }
    expect(tokens).toMatch(/Top Layer/);

    const values = parseLayerValues(tokens);
    const ordered = LAYER_TOKEN_NAMES.map((name) => values.get(name)!);
    for (let i = 1; i < ordered.length; i += 1) {
      expect(ordered[i]!).toBeGreaterThan(ordered[i - 1]!);
    }
  });

  it("maps trip shell and overlay consumers to semantic layer tokens", () => {
    expect(read("features/app-shell/TripShellLayout.module.scss")).toMatch(
      /z-index:\s*var\(--layer-nav\)/,
    );
    expect(read("features/places/placeSearch.module.scss")).toMatch(
      /z-index:\s*var\(--layer-popover\)/,
    );
    expect(read("features/transport/TransportAddMenu.module.scss")).toMatch(
      /z-index:\s*var\(--layer-popover\)/,
    );
    expect(read("features/quick-add/QuickAdd.module.scss")).toMatch(
      /z-index:\s*var\(--layer-trip-overlay\)/,
    );
    expect(read("features/itinerary/DayPage.module.scss")).toMatch(
      /z-index:\s*var\(--layer-trip-overlay\)/,
    );
    expect(read("features/accommodations/TaxiModeOverlay.module.scss")).toMatch(
      /z-index:\s*var\(--layer-trip-overlay\)/,
    );
    expect(read("features/pwa/ConnectivityBanner.module.scss")).toMatch(
      /z-index:\s*var\(--layer-system\)/,
    );
    expect(read("features/pwa/SwUpdatePrompt.module.scss")).toMatch(
      /z-index:\s*var\(--layer-system\)/,
    );
  });

  it("does not use removed global raw overlay z-index values on migrated surfaces", () => {
    const migrated = [
      "features/app-shell/TripShellLayout.module.scss",
      "features/quick-add/QuickAdd.module.scss",
      "features/itinerary/DayPage.module.scss",
      "features/places/placeSearch.module.scss",
      "features/transport/TransportAddMenu.module.scss",
      "features/accommodations/TaxiModeOverlay.module.scss",
      "features/pwa/ConnectivityBanner.module.scss",
      "features/pwa/SwUpdatePrompt.module.scss",
    ];
    for (const file of migrated) {
      const source = read(file);
      expect(source).not.toMatch(/z-index:\s*10\s*;/);
      expect(source).not.toMatch(/z-index:\s*20\s*;/);
      expect(source).not.toMatch(/z-index:\s*30\s*;/);
      expect(source).not.toMatch(/z-index:\s*40\s*;/);
      expect(source).not.toMatch(/z-index:\s*100\s*;/);
    }
  });

  it("defers SwUpdatePrompt presentation while Quick Add overlay is open", () => {
    expect(
      shouldRenderSwUpdatePrompt({ showPrompt: true, quickAddOverlayOpen: true }),
    ).toBe(false);
    expect(
      shouldRenderSwUpdatePrompt({ showPrompt: true, quickAddOverlayOpen: false }),
    ).toBe(true);
    expect(
      shouldRenderSwUpdatePrompt({ showPrompt: false, quickAddOverlayOpen: true }),
    ).toBe(false);
  });

  it("wires SwUpdatePrompt to Quick Add open store and deferral helper", () => {
    const prompt = read("features/pwa/SwUpdatePrompt.client.tsx");
    expect(prompt).toContain("subscribeQuickAddOverlayOpen");
    expect(prompt).toContain("shouldRenderSwUpdatePrompt");
    expect(prompt).not.toContain("skipWaiting");
  });

  it("syncs Quick Add open state from QuickAddProvider without duplicate state", () => {
    const provider = read("features/quick-add/QuickAddProvider.client.tsx");
    expect(provider).toContain("setQuickAddOverlayOpen(isOpen)");
  });

  it("removes misleading z-index from native travelers dialog overlay", () => {
    const travelers = read("features/trips/settings/travelers/TravelersSettings.module.scss");
    expect(travelers).toContain(".overlay");
    expect(travelers).not.toMatch(/\.overlay[\s\S]*z-index:\s*200/);
  });

  it("keeps ConnectivityBanner non-interactive", () => {
    expect(read("features/pwa/ConnectivityBanner.module.scss")).toContain(
      "pointer-events: none",
    );
  });
});

describe("quick-add overlay open store", () => {
  it("notifies subscribers when open state changes", () => {
    setQuickAddOverlayOpen(false);
    let snapshot = false;
    const unsubscribe = subscribeQuickAddOverlayOpen(() => {
      snapshot = getQuickAddOverlayOpenSnapshot();
    });
    setQuickAddOverlayOpen(true);
    expect(snapshot).toBe(true);
    setQuickAddOverlayOpen(false);
    unsubscribe();
  });
});
