import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TRANSPORT_TYPES } from "@/features/transport/transport-types";

const root = join(process.cwd(), "src");

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("Global Quick Add — pinned primary action contract", () => {
  it("enables pinnedActionFooter only from mobile Quick Add host", () => {
    const host = read("features/quick-add/QuickAddHost.client.tsx");
    expect(host).toContain("pinnedActionFooter={!isDesktop && isFormStep}");
    expect(host).toContain("hostBodyQuickAddForm");

    const forms = read("features/quick-add/QuickAddForms.client.tsx");
    expect(forms).not.toContain("QUICK_ADD_PINNED_ACTION");
    expect(forms).toContain("pinnedActionFooter={pinnedActionFooter}");
  });

  it("AuthSubmitButton primary uses auth token with semantic fallback", () => {
    const form = read("features/auth/AuthForm.module.scss");
    expect(form).toContain("background: var(--auth-primary, var(--color-primary))");
    expect(form).toContain(
      "background: var(--auth-primary-hover, var(--color-primary-hover))",
    );
    const authShell = read("features/auth/AuthPageShell.module.scss");
    expect(authShell).toContain("--auth-primary: var(--color-primary)");
  });

  it("defines scroll fields and pinned footer presentation classes", () => {
    const flow = read("features/itinerary/AddItemFlow.module.scss");
    expect(flow).toContain(".plannerFormPinned");
    expect(flow).toMatch(/\.plannerFormPinned[\s\S]*flex:\s*1\s*1\s*0/);
    expect(flow).toContain(".plannerFormScroll");
    expect(flow).toContain(".pinnedActionFooter");
    expect(flow).toMatch(/\.pinnedActionFooter[\s\S]*flex-shrink:\s*0/);
    expect(flow).toMatch(/\.pinnedActionFooter[\s\S]*position:\s*static/);
    expect(flow).toMatch(/\.plannerFormScroll[\s\S]*overflow-y:\s*auto/);
    expect(flow).toContain("padding-bottom: calc(var(--space-2) + var(--safe-bottom))");
  });

  it("constrains mobile Quick Add flex chain host to form", () => {
    const scss = read("features/quick-add/QuickAdd.module.scss");
    const mobileBlock = scss.split("@media (max-width: 1023px)")[1]?.split("@media")[0] ?? "";
    expect(mobileBlock).toMatch(/\.hostBodyQuickAddForm[\s\S]*flex:\s*1\s*1\s*0/);
    expect(mobileBlock).toMatch(/\.hostBodyQuickAddForm[\s\S]*height:\s*100%/);
    expect(mobileBlock).toMatch(/\.quickAddFormMount[\s\S]*flex:\s*1\s*1\s*0/);
    expect(mobileBlock).toMatch(/\.quickAddFormMount form[\s\S]*height:\s*100%/);
  });

  it("uses quickAddFormInner on accommodation and other pinned mounts", () => {
    const forms = read("features/quick-add/QuickAddForms.client.tsx");
    expect(forms).toContain("quickAddFormInner");
    expect(forms).toMatch(/accommodation[\s\S]*quickAddFormInner/);
    expect(forms).toMatch(/transport[\s\S]*quickAddFormInner/);
  });

  it("wires transport planner footer outside QuickAddPinnedFields scroll", () => {
    const transport = read("features/transport/TransportForm.client.tsx");
    expect(transport).toContain("QuickAddPinnedFields");
    expect(transport).toContain("pinnedActionFooter");
    expect(transport).toContain("resolvePinnedPlannerFooterClass");
    for (const type of TRANSPORT_TYPES) {
      expect(transport).toContain("createPlannerSubmit");
      void type;
    }
  });

  it("wires accommodation, activity, expense, document, and reminder pinned footers", () => {
    const accommodation = read("features/accommodations/TripAccommodationSettings.tsx");
    expect(accommodation).toContain("pinnedActionFooter");
    expect(accommodation).toContain("QuickAddPinnedFields");

    const activity = read("features/itinerary/ActivityForm.tsx");
    expect(activity).toContain("pinnedActionFooter");
    expect(activity).toContain("showDetails");
    expect(activity).toContain("QuickAddPinnedFields");

    const expense = read("features/finance/FinanceExpenseSheet.client.tsx");
    expect(expense).toContain("pinnedActionFooter");
    expect(expense).toContain("QuickAddPinnedFields");

    const document = read("features/documents/TripDocumentSettings.tsx");
    expect(document).toContain("pinnedActionFooter");
    expect(document).toContain("QuickAddPinnedFields");

    const forms = read("features/quick-add/QuickAddForms.client.tsx");
    expect(forms).toContain("dayActionReminderAdd");
    expect(forms).toContain("pinnedActionFooter");
  });

  it("keeps DayActionSurface and standalone paths without pinnedActionFooter defaults", () => {
    const day = read("features/itinerary/DayActionSurface.client.tsx");
    expect(day).not.toContain("pinnedActionFooter");

    const newTransport = read("app/app/trips/[tripId]/transport/new/page.tsx");
    expect(newTransport).not.toContain("pinnedActionFooter");
  });

  it("does not add visualViewport or keyboard JS", () => {
    const host = read("features/quick-add/QuickAddHost.client.tsx");
    expect(host).not.toContain("visualViewport");
  });
});
