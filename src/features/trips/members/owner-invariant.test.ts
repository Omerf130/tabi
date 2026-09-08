import { describe, expect, it } from "vitest";
import {
  canRemoveOrDemoteOwner,
  wouldLeaveZeroOwners,
} from "./owner-invariant";

describe("owner invariant", () => {
  it("blocks removing or demoting the sole owner", () => {
    const owners = [{ id: "a" }];
    expect(canRemoveOrDemoteOwner(owners, "a")).toBe(false);
    expect(wouldLeaveZeroOwners(1, true)).toBe(true);
  });

  it("allows removing or demoting one owner when another remains", () => {
    const owners = [{ id: "a" }, { id: "b" }];
    expect(canRemoveOrDemoteOwner(owners, "a")).toBe(true);
    expect(wouldLeaveZeroOwners(2, true)).toBe(false);
  });

  it("allows member removal regardless of owner count", () => {
    expect(wouldLeaveZeroOwners(1, false)).toBe(false);
  });
});
