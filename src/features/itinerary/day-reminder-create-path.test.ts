import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("itinerary day reminder create path", () => {
  it("routes day add-menu reminder selection to Quick Add instead of reminder-create", () => {
    const surface = readFileSync(
      join(process.cwd(), "src/features/itinerary/DayActionSurface.client.tsx"),
      "utf8",
    );
    const types = readFileSync(
      join(process.cwd(), "src/features/itinerary/day-action-surface.types.ts"),
      "utf8",
    );
    const shell = readFileSync(
      join(process.cwd(), "src/features/itinerary/DayPageShell.client.tsx"),
      "utf8",
    );

    expect(types).not.toContain("reminder-create");
    expect(surface).toContain("onOpenReminderQuickAdd");
    expect(surface).not.toMatch(/kind:\s*"reminder-create"/);
    expect(shell).toContain("onOpenReminderQuickAdd={openReminderCreate}");
    expect(shell).toContain('initialStep: { kind: "form", action: "reminder" }');
  });
});
