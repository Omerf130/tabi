import { describe, expect, it } from "vitest";
import { classifyDestinationVisualGroup } from "./classify-visual-group";

describe("classifyDestinationVisualGroup", () => {
  it("maps JP to japan", () => {
    expect(classifyDestinationVisualGroup("JP")).toBe("japan");
  });

  it("maps European country codes to europe", () => {
    expect(classifyDestinationVisualGroup("FR")).toBe("europe");
    expect(classifyDestinationVisualGroup("it")).toBe("europe");
  });

  it("maps unknown codes to fallback", () => {
    expect(classifyDestinationVisualGroup("US")).toBe("fallback");
    expect(classifyDestinationVisualGroup(undefined)).toBe("fallback");
  });
});
