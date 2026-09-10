import { afterEach, describe, expect, it, vi } from "vitest";
import { confirmDayActionDiscard } from "./confirm-day-action-discard";

describe("confirmDayActionDiscard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("allows close when the form is clean", () => {
    expect(confirmDayActionDiscard(false)).toBe(true);
  });

  it("asks before closing a dirty form", () => {
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal("window", { confirm: confirmMock });
    expect(confirmDayActionDiscard(true)).toBe(false);
    expect(confirmMock).toHaveBeenCalled();
  });
});
