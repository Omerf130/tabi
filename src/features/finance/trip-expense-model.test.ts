import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("TripExpense model contract", () => {
  it("declares list, category, and partial unique indexes", () => {
    const source = readFileSync(
      join(process.cwd(), "src/models/TripExpense.ts"),
      "utf8",
    );

    expect(source).toContain("{ tripId: 1, expenseDate: -1, createdAt: -1 }");
    expect(source).toContain("{ tripId: 1, category: 1 }");
    expect(source).toContain("partialFilterExpression: { sourceType: { $ne: \"manual\" } }");
    expect(source).toContain("{ tripId: 1, sourceType: 1, sourceId: 1 }");
  });
});

describe("TripFinanceSettings model contract", () => {
  it("requires one settings document per trip", () => {
    const source = readFileSync(
      join(process.cwd(), "src/models/TripFinanceSettings.ts"),
      "utf8",
    );

    expect(source).toContain("unique: true");
    expect(source).toContain("budgetAmount");
    expect(source).not.toContain("enabledAt");
  });
});
