import { describe, expect, it } from "vitest";
import { buildEmergencyResourceActions } from "./resource-actions";

const labels = {
  openWebsite: "Website",
  openInMap: "Map",
  copyReference: "Copy",
};

describe("buildEmergencyResourceActions", () => {
  it("uses preferred maps app for address actions", () => {
    const actions = buildEmergencyResourceActions(
      { address: "Tokyo Tower" },
      labels,
      "waze",
    );
    const mapAction = actions.find((action) => action.type === "address");
    expect(mapAction?.href).toContain("waze.com");
  });

  it("leaves generic external url unchanged", () => {
    const actions = buildEmergencyResourceActions(
      { url: "https://example.com/help" },
      labels,
      "apple",
    );
    const urlAction = actions.find((action) => action.type === "url");
    expect(urlAction?.href).toBe("https://example.com/help");
  });
});
