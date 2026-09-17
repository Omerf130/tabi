import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getQuickAddActionsForRole } from "./quick-add-menu";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("Product Hardening 2 — Quick Add mobile layout contract", () => {
  it("removes competing 92vh panel and 70/85dvh mobile body caps", () => {
    const scss = read("features/quick-add/QuickAdd.module.scss");
    const mobileRules = scss.split("@media (max-width: 1023px)")[1]?.split("@media")[0] ?? "";
    expect(scss).not.toContain("92vh");
    expect(mobileRules).not.toContain("70dvh");
    expect(mobileRules).not.toContain("85dvh");
    expect(scss).not.toContain("hostBodyForm");
    expect(scss).not.toContain("mobileSheetPanelForm");
    expect(scss).toMatch(/\.hostBody \{\s*min-height: 0;\s*padding/);
    expect(scss).toMatch(/\.desktopPanel \.hostBody[\s\S]*max-height: min\(70dvh, 36rem\)/);
  });

  it("uses a definite 100dvh mobile panel height and flex scroll chain", () => {
    const scss = read("features/quick-add/QuickAdd.module.scss");
    const mobileBlock = scss.split("@media (max-width: 1023px)")[1]?.split("@media")[0] ?? "";
    expect(mobileBlock).toContain("height: min(100dvh, 48rem)");
    expect(mobileBlock).toContain("max-height: min(100dvh, 48rem)");
    expect(scss).toContain(".hostBody");
    expect(scss).toMatch(/\.hostBody[\s\S]*min-height:\s*0/);
    expect(scss).toMatch(/\.mobileSheetPanel[\s\S]*min-height:\s*0/);
    expect(mobileBlock).toContain("hostBodyQuickAddForm");
    expect(mobileBlock).toMatch(/\.hostBodyQuickAddForm[\s\S]*overflow:\s*hidden/);
    expect(mobileBlock).toMatch(/\.hostBodyQuickAddForm[\s\S]*flex:\s*1\s*1\s*0/);
  });

  it("keeps form-step host body non-scrolling; field scroll lives in plannerFormScroll", () => {
    const scss = read("features/quick-add/QuickAdd.module.scss");
    const flow = read("features/itinerary/AddItemFlow.module.scss");
    expect(scss).toMatch(/\.mobileSheetPanel[\s\S]*overflow:\s*hidden/);
    expect(flow).toMatch(/\.plannerFormScroll[\s\S]*overflow-y:\s*auto/);
  });

  it("scopes desktop dialog scroll caps separately from mobile sheet", () => {
    const scss = read("features/quick-add/QuickAdd.module.scss");
    expect(scss).toContain(".desktopPanel .hostBody");
    expect(scss).toContain("max-height: min(70dvh, 36rem)");
    expect(scss).toContain(".desktopDialog");
    expect(scss).toContain("calc(100dvh - var(--space-8))");
  });

  it("applies overlay safe-bottom token on shared planner footer", () => {
    const flow = read("features/itinerary/AddItemFlow.module.scss");
    expect(flow).toContain("padding-bottom: calc(var(--space-2) + var(--safe-bottom))");
  });

  it("uses embedded expense and document Quick Add pinned footer wiring", () => {
    const expense = read("features/finance/FinanceExpenseSheet.client.tsx");
    expect(expense).toContain('presentation === "embedded"');
    expect(expense).toContain("pinnedActionFooter");
    expect(expense).toContain("resolvePinnedPlannerFooterClass");

    const forms = read("features/quick-add/QuickAddForms.client.tsx");
    expect(forms).toContain("overlayActionFooter");
    expect(forms).toContain("pinnedActionFooter");

    const docs = read("features/documents/TripDocumentSettings.tsx");
    expect(docs).toContain("overlayActionFooter");
    expect(docs).toContain("pinnedActionFooter");
  });

  it("keeps all six owner Quick Add actions and member reminder-only menu", () => {
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

  it("does not add visualViewport keyboard measurement JS to Quick Add host", () => {
    const host = read("features/quick-add/QuickAddHost.client.tsx");
    expect(host).not.toContain("visualViewport");
    expect(host).not.toContain("keyboard-inset");
    expect(host).toContain("hostBodyQuickAddForm");
  });

  it("regression: BottomNav and Hardening 1 shell safe-top unchanged", () => {
    const nav = read("components/ui/BottomNav/BottomNav.module.scss");
    expect(nav).toContain("var(--safe-bottom)");

    const shell = read("features/app-shell/TripShellLayout.module.scss");
    expect(shell).toContain("padding-top: var(--safe-top)");

    const daySurface = read("features/itinerary/DayActionSurface.client.tsx");
    expect(daySurface).toContain("sheetPanelForm");
    expect(daySurface).not.toContain("QuickAdd.module.scss");
  });
});
