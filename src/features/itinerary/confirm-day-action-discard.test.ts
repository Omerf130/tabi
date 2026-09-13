import { afterEach, describe, expect, it, vi } from "vitest";
import { createHebrewActivityTranslator } from "@/features/i18n/test-translators";
import { confirmDayActionDiscard } from "./confirm-day-action-discard";

const t = createHebrewActivityTranslator();

describe("confirmDayActionDiscard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows close when the form is clean", () => {
    expect(confirmDayActionDiscard(false, t)).toBe(true);
  });

  it("asks before closing a dirty form", () => {
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal("window", { confirm: confirmMock });
    expect(confirmDayActionDiscard(true, t)).toBe(false);
    expect(confirmMock).toHaveBeenCalled();
  });
});
