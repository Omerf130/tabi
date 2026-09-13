import { describe, expect, it } from "vitest";
import {
  formatEntityLinkedCostDisplay,
  toEntityLinkedCostViewModel,
} from "./entity-linked-cost-presentation";

const costPrefix = "עלות";

describe("transport read presentation", () => {
  it("formats linked cost labels for transport expenses", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 4500,
      currency: "JPY",
      category: "transport",
    });

    expect(linkedCost.label).toContain("¥");
    expect(formatEntityLinkedCostDisplay(linkedCost, costPrefix)).toBe(
      `עלות: ${linkedCost.label}`,
    );
  });
});

describe("accommodation read presentation", () => {
  it("exposes formatted original cost on accommodation view models", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 350,
      currency: "ILS",
      category: "accommodation",
    });

    expect(formatEntityLinkedCostDisplay(linkedCost, costPrefix)).toBe(`עלות: ${linkedCost.label}`);
    expect(linkedCost.label).toMatch(/350/);
  });

  it("leaves accommodation without linked expense unchanged", () => {
    const accommodation = {
      id: "acc-1",
      name: "Hotel",
    };

    expect("linkedCost" in accommodation ? accommodation.linkedCost : undefined).toBeUndefined();
  });
});

describe("activity read presentation", () => {
  it("exposes compact original cost label for activity rows", () => {
    const linkedCost = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 4500,
      currency: "JPY",
      category: "food",
    });

    expect(linkedCost.label).toContain("¥");
    expect(linkedCost.label).not.toMatch(/עלות/);
  });

  it("leaves activity without linked expense unchanged", () => {
    const activity = {
      id: "activity-1",
      title: "Lunch",
    };

    expect("linkedCost" in activity ? activity.linkedCost : undefined).toBeUndefined();
  });
});
