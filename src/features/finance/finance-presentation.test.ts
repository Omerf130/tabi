import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const featureRoot = join(process.cwd(), "src/features/finance");

describe("finance presentation", () => {
  it("does not add a dedicated expense detail route", () => {
    expect(
      readFileSync(join(process.cwd(), "src/app/app/trips/[tripId]/finance/page.tsx"), "utf8"),
    ).not.toContain("[expenseId]");
  });

  it("uses CSS donut without chart dependencies", () => {
    const source = readFileSync(join(featureRoot, "FinanceCategoryDonut.tsx"), "utf8");
    expect(source).toContain("conic-gradient");
    expect(source).not.toMatch(/recharts|chart\.js|d3/i);
  });

  it("shows Add Expense only for owners in page content", () => {
    const source = readFileSync(join(featureRoot, "FinancePageContent.tsx"), "utf8");
    expect(source).toContain("model.isOwner");
    expect(source).toContain("addExpense");
  });

  it("places amount before title in manual expense sheet", () => {
    const source = readFileSync(join(featureRoot, "FinanceExpenseSheet.client.tsx"), "utf8");
    const amountIndex = source.indexOf("amountCurrencyFields");
    const titleIndex = source.indexOf('name="title"');
    expect(amountIndex).toBeGreaterThan(-1);
    expect(titleIndex).toBeGreaterThan(amountIndex);
  });

  it("keeps Add Expense CTA in normal content flow", () => {
    const source = readFileSync(join(featureRoot, "FinancePage.module.scss"), "utf8");
    expect(source).not.toContain("position: sticky");
    expect(source).toContain(".addExpenseBar");
  });

  it("uses compact category chips in expense sheet", () => {
    const source = readFileSync(join(featureRoot, "FinancePage.module.scss"), "utf8");
    expect(source).toContain("grid-template-columns: repeat(4");
    expect(source).toContain("border-radius: 999px");
  });

  it("shows no-budget owner action and member read-only notice", () => {
    const source = readFileSync(join(featureRoot, "FinancePageContent.tsx"), "utf8");
    expect(source).toContain("budgetInlineAction");
    expect(source).toContain("setBudgetCta");
    expect(source).toContain("memberNoBudget");
  });

  it("keeps budget hierarchy labels for spent, remaining, and percent", () => {
    const source = readFileSync(join(featureRoot, "FinancePageContent.tsx"), "utf8");
    expect(source).toContain("FINANCE_MESSAGES.spent");
    expect(source).toContain("FINANCE_MESSAGES.remaining");
    expect(source).toContain("FINANCE_MESSAGES.percentConsumed");
  });

  it("avoids horizontal overflow on finance hero", () => {
    const source = readFileSync(join(featureRoot, "FinancePage.module.scss"), "utf8");
    expect(source).toContain("overflow-x: hidden");
    expect(source).toContain("overflow-wrap: anywhere");
  });
});
