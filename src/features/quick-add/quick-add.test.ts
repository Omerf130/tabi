import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  MOBILE_BOTTOM_NAV_SLOTS,
  NAV_SECTIONS,
  buildTripNavHref,
  getActiveNavSection,
} from "@/features/app-shell/navigation";
import type { AppTranslator } from "@/features/i18n/create-app-translator";
import { getQuickAddActionsForRole, getQuickAddMenuOptions } from "./quick-add-menu";
import { canQuickAddGoBack, getQuickAddBackTarget } from "./quick-add-navigation";
import { isAllowedQuickAddOriginPath } from "./validate-origin-path";

const TRIP = "507f1f77bcf86cd799439011";

function readSource(relativePath: string): string {
  return readFileSync(join(process.cwd(), "src", relativePath), "utf8");
}

describe("Quick Add navigation", () => {
  it("uses Home / Itinerary / quick-add / More / Settings on mobile", () => {
    expect(MOBILE_BOTTOM_NAV_SLOTS).toEqual([
      "home",
      "itinerary",
      "quick-add",
      "more",
      "settings",
    ]);
    expect(NAV_SECTIONS).not.toContain("documents");
  });

  it("maps documents routes to more for active tab", () => {
    expect(getActiveNavSection(`/app/trips/${TRIP}/documents`, TRIP)).toBe("more");
  });

  it("validates allowlisted origin paths", () => {
    expect(isAllowedQuickAddOriginPath(TRIP, `/app/trips/${TRIP}/finance`)).toBe(
      true,
    );
    expect(isAllowedQuickAddOriginPath(TRIP, "/app/trips/other/finance")).toBe(
      false,
    );
    expect(isAllowedQuickAddOriginPath(TRIP, "https://evil.test")).toBe(false);
  });
});

describe("Quick Add menu permissions", () => {
  it("shows six owner actions and one member action", () => {
    expect(getQuickAddActionsForRole("owner")).toEqual([
      "activity",
      "accommodation",
      "transport",
      "reminder",
      "expense",
      "document",
    ]);
    expect(getQuickAddActionsForRole("member")).toEqual(["reminder"]);
  });

  it("builds role-filtered menu option lists", () => {
    const t = ((key: string) => key) as AppTranslator<"QuickAdd">;
    expect(getQuickAddMenuOptions(t, "member")).toHaveLength(1);
    expect(getQuickAddMenuOptions(t, "member")[0]?.id).toBe("reminder");
    expect(getQuickAddMenuOptions(t, "owner")).toHaveLength(6);
  });
});

describe("Quick Add step navigation", () => {
  it("supports back from transport type and forms", () => {
    expect(canQuickAddGoBack({ kind: "transport-type" })).toBe(true);
    expect(getQuickAddBackTarget({ kind: "transport-type" })).toEqual({
      kind: "menu",
    });
    expect(
      getQuickAddBackTarget({ kind: "form", action: "transport", transportType: "flight" }),
    ).toEqual({ kind: "transport-type" });
    expect(getQuickAddBackTarget({ kind: "form", action: "activity" })).toEqual({
      kind: "menu",
    });
  });
});

describe("Quick Add implementation wiring", () => {
  it("uses a center action button in bottom nav", () => {
    const bottomNav = readSource("components/ui/BottomNav/BottomNav.tsx");
    expect(bottomNav).toContain('kind: "action"');
    expect(bottomNav).not.toContain('href="#"');
  });

  it("mounts QuickAddProvider at trip shell level", () => {
    const shell = readSource("features/app-shell/TripShellLayout.tsx");
    expect(shell).toContain("QuickAddProvider");
    expect(shell).toContain("QuickAddHost");
  });

  it("opens accommodation add without manage detour", () => {
    const button = readSource("features/accommodations/AccommodationAddButton.client.tsx");
    expect(button).toContain("useQuickAdd");
    expect(button).not.toContain("/manage/accommodations");
  });

  it("delegates itinerary day add to Quick Add", () => {
    const dayShell = readSource("features/itinerary/DayPageShell.client.tsx");
    expect(dayShell).toContain("openQuickAdd");
    expect(dayShell).toContain("date: day.date");
  });

  it("consolidates activity creation into ActivityForm", () => {
    const activityForm = readSource("features/itinerary/ActivityForm.tsx");
    expect(activityForm).not.toContain("ActivityAddOverlay");
    expect(() =>
      readFileSync(
        join(process.cwd(), "src/features/itinerary/ActivityAddOverlay.client.tsx"),
        "utf8",
      ),
    ).toThrow();
  });

  it("exposes desktop quick add in rail", () => {
    const nav = readSource("features/app-shell/TripPrimaryNav.tsx");
    expect(nav).toContain("railQuickAddButton");
    expect(nav).toContain("MOBILE_BOTTOM_NAV_SLOTS");
  });

  it("keeps documents deep links valid", () => {
    expect(buildTripNavHref(TRIP, "more")).toBe(`/app/trips/${TRIP}/more`);
    expect(getActiveNavSection(`/app/trips/${TRIP}/documents`, TRIP)).toBe("more");
  });
});
