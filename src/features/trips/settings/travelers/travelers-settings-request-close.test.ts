import { describe, expect, it, vi } from "vitest";
import { closeDialogIfOpen } from "./travelers-settings-request-close";

describe("TravelersSettingsSheet close", () => {
  it("closes an open modal then notifies parent without saving", () => {
    const close = vi.fn(function (this: { open: boolean }) {
      this.open = false;
    });
    const dialog = { open: true, close };
    const onParentClose = vi.fn();
    const save = vi.fn();

    closeDialogIfOpen(dialog);
    onParentClose();

    expect(dialog.open).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
    expect(onParentClose).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  it("does not call close when dialog is already closed", () => {
    const close = vi.fn();
    const dialog = { open: false, close };

    closeDialogIfOpen(dialog);

    expect(close).not.toHaveBeenCalled();
  });
});
