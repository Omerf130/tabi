import { describe, expect, it, vi } from "vitest";
import {
  runSerwistUpdateCheck,
  shouldRunStartupSerwistUpdate,
} from "./sw-update-check";

describe("runSerwistUpdateCheck", () => {
  it("resolves when serwist.update rejects", async () => {
    const serwist = {
      update: vi.fn().mockRejectedValue(new Error("offline")),
    };

    await expect(runSerwistUpdateCheck(serwist)).resolves.toBeUndefined();
    expect(serwist.update).toHaveBeenCalledTimes(1);
  });

  it("calls serwist.update once on success", async () => {
    const serwist = {
      update: vi.fn().mockResolvedValue(undefined),
    };

    await runSerwistUpdateCheck(serwist);
    expect(serwist.update).toHaveBeenCalledTimes(1);
  });
});

describe("shouldRunStartupSerwistUpdate", () => {
  it("allows only one startup check per page load", () => {
    vi.stubGlobal("window", { __tabiSwStartupUpdateDone: undefined as boolean | undefined });
    try {
      expect(shouldRunStartupSerwistUpdate()).toBe(true);
      expect(shouldRunStartupSerwistUpdate()).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
