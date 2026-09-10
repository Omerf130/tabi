import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  formatEntityLinkedCostDisplay,
  formatEntityLinkedCostLabel,
  toEntityLinkedCostViewModel,
} from "./entity-linked-cost-presentation";
import { attachLinkedCostsToIds } from "./linked-expense-queries";

const { listLinkedTripExpensesForSourcesMock } = vi.hoisted(() => ({
  listLinkedTripExpensesForSourcesMock: vi.fn(),
}));

vi.mock("./finance-linked-expense-domain", () => ({
  getLinkedTripExpenseForSource: vi.fn(),
  listLinkedTripExpensesForSources: listLinkedTripExpensesForSourcesMock,
}));

describe("entity linked cost presentation", () => {
  it("formats original JPY amount for read cards", () => {
    expect(formatEntityLinkedCostLabel(4500, "JPY")).toMatch(/4,500|4500/);
    expect(formatEntityLinkedCostLabel(4500, "JPY")).toContain("¥");
  });

  it("formats original EUR amount for read cards", () => {
    expect(formatEntityLinkedCostLabel(120, "EUR")).toMatch(/120/);
    expect(formatEntityLinkedCostLabel(120, "EUR")).toMatch(/€|EUR/);
  });

  it("formats original ILS amount for read cards", () => {
    expect(formatEntityLinkedCostLabel(350, "ILS")).toMatch(/350/);
    expect(formatEntityLinkedCostLabel(350, "ILS")).toMatch(/₪|ILS/);
  });

  it("builds view model from original amount and currency, not baseAmount", () => {
    const viewModel = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 4500,
      currency: "JPY",
      category: "transport",
    });

    expect(viewModel.amount).toBe(4500);
    expect(viewModel.currency).toBe("JPY");
    expect(viewModel.label).toBe(formatEntityLinkedCostLabel(4500, "JPY"));
    expect(viewModel.label).not.toContain("ILS");
  });

  it("prefixes card copy with עלות", () => {
    const viewModel = toEntityLinkedCostViewModel({
      id: "expense-1",
      amount: 350,
      currency: "ILS",
      category: "accommodation",
    });

    expect(formatEntityLinkedCostDisplay(viewModel)).toBe(`עלות: ${viewModel.label}`);
  });
});

describe("attachLinkedCostsToIds batching", () => {
  it("loads linked expenses in one batch query for multiple entities", async () => {
    listLinkedTripExpensesForSourcesMock.mockResolvedValue(
      new Map([
        [
          "transport-1",
          {
            id: "expense-1",
            amount: 4500,
            currency: "JPY",
            category: "transport",
          },
        ],
        [
          "transport-2",
          {
            id: "expense-2",
            amount: 120,
            currency: "EUR",
            category: "flights",
          },
        ],
      ]),
    );

    const items = [{ id: "transport-1" }, { id: "transport-2" }, { id: "transport-3" }];
    const result = await attachLinkedCostsToIds("trip-1", "transport", items);

    expect(listLinkedTripExpensesForSourcesMock).toHaveBeenCalledTimes(1);
    expect(listLinkedTripExpensesForSourcesMock).toHaveBeenCalledWith("trip-1", "transport", [
      "transport-1",
      "transport-2",
      "transport-3",
    ]);
    expect(result[0]?.linkedCost?.label).toContain("¥");
    expect(result[1]?.linkedCost?.label).toMatch(/120/);
    expect(result[2]?.linkedCost).toBeUndefined();
  });
});

describe("entity models remain free of monetary fields", () => {
  const modelPaths = [
    join(process.cwd(), "src/models/Activity.ts"),
    join(process.cwd(), "src/models/Accommodation.ts"),
    join(process.cwd(), "src/models/Transport.ts"),
  ];

  it.each(modelPaths)("%s has no persisted cost fields", (modelPath) => {
    const source = readFileSync(modelPath, "utf8");
    expect(source).not.toMatch(/\b(cost|amount|currency|expenseId)\b:/);
  });
});
