import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVisualGroupForKey } from "./registry";
import { pickVisualKeyForGroup } from "./pick-visual-key";

const randomIntMock = vi.fn();

vi.mock("node:crypto", () => ({
  randomInt: (...args: unknown[]) => randomIntMock(...args),
}));

describe("pickVisualKeyForGroup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("picks a key from the requested group", () => {
    randomIntMock.mockReturnValue(0);
    const key = pickVisualKeyForGroup("japan");
    expect(getVisualGroupForKey(key)).toBe("japan");
  });

  it("can pick another key in the same group", () => {
    randomIntMock.mockReturnValue(1);
    const key = pickVisualKeyForGroup("japan");
    expect(getVisualGroupForKey(key)).toBe("japan");
    expect(key).toBe("japan-02");
  });
});
