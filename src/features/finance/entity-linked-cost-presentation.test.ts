import { describe, expect, it } from "vitest";
import {
  formatEntityLinkedCostDisplay,
  toEntityLinkedCostViewModel,
} from "./entity-linked-cost-presentation";

describe("entity linked cost presentation", () => {
  it("formats linked cost with localized prefix", () => {
    const viewModel = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 350,
      currency: "ILS",
      category: "accommodation",
    });

    expect(formatEntityLinkedCostDisplay(viewModel, "עלות")).toBe(`עלות: ${viewModel.label}`);
    expect(viewModel.label).toMatch(/350/);
  });
});
