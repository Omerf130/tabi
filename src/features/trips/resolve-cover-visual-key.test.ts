import { describe, expect, it, vi } from "vitest";
import { resolveCoverVisualKeyForDestination } from "./resolve-cover-visual-key";

const { pickVisualKeyForGroupMock } = vi.hoisted(() => ({
  pickVisualKeyForGroupMock: vi.fn(),
}));

vi.mock("@/features/destination-visuals/pick-visual-key", () => ({
  pickVisualKeyForGroup: pickVisualKeyForGroupMock,
}));

describe("resolveCoverVisualKeyForDestination", () => {
  it("returns a validated visual key for the destination group", () => {
    pickVisualKeyForGroupMock.mockReturnValue("japan-01");

    const key = resolveCoverVisualKeyForDestination({
      googlePlaceId: "x",
      displayName: "Tokyo",
      countryCode: "JP",
      latitude: 1,
      longitude: 2,
    });

    expect(key).toBe("japan-01");
    expect(pickVisualKeyForGroupMock).toHaveBeenCalledWith("japan");
  });
});
