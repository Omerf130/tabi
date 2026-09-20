import { describe, expect, it } from "vitest";
import { createAppTranslator } from "@/features/i18n/create-app-translator";
import { formatReminderDisplayLine } from "./format-reminder";

describe("legacy reminder display", () => {
  it("renders saved local date and time without conversion", () => {
    const t = createAppTranslator("TripReminders", "en");

    expect(formatReminderDisplayLine("2026-10-23", "09:00", "2026-10-22", t)).toContain(
      "09:00",
    );
    expect(formatReminderDisplayLine("2026-10-23", "09:00", "2026-10-23", t)).toBe(
      `${t("todayLabel")} · 09:00`,
    );
  });
});
