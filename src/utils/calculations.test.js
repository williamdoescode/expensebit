import { describe, expect, it } from "vitest";
import { calculateTrackerTotals, getRowTotal } from "./calculations";

describe("financial calculations", () => {
  it("calculates in integer centavos", () => {
    expect(getRowTotal({ quantity: 3, unitCost: 1_099 })).toBe(3_297);
  });

  it("derives available, expense, and remaining totals", () => {
    expect(calculateTrackerTotals({
      monthlyIncome: 3_500_000,
      targetSavings: 800_000,
      accumulatedOverallBalance: 300_000,
      accumulatedSavings: 500_000,
      expenses: [
        { quantity: 2, unitCost: 120_000, checked: true },
        { quantity: 1, unitCost: 169_900, checked: false },
      ],
    })).toEqual({
      monthlyIncome: 3_500_000,
      targetSavings: 800_000,
      availableBudget: 2_700_000,
      idealExpenses: 409_900,
      actualExpenses: 240_000,
      incomeOverage: 0,
      overallBalanceDeduction: 0,
      accumulatedOverallBalance: 300_000,
      savingsWithdrawals: 0,
      accumulatedSavings: 500_000,
      remainingBudget: 2_460_000,
    });
  });

  it("reports a negative remaining budget", () => {
    const totals = calculateTrackerTotals({ monthlyIncome: 1_000, targetSavings: 0, expenses: [{ quantity: 2, unitCost: 600, checked: true }] });
    expect(totals.remainingBudget).toBe(-200);
  });

  it("does not count unchecked rows as actual expenses", () => {
    const totals = calculateTrackerTotals({ monthlyIncome: 1_000, targetSavings: 0, expenses: [{ quantity: 1, unitCost: 800, checked: false }] });
    expect(totals.idealExpenses).toBe(800);
    expect(totals.actualExpenses).toBe(0);
    expect(totals.remainingBudget).toBe(1_000);
  });

  it("deducts checked Savings rows from accumulated savings", () => {
    const totals = calculateTrackerTotals({
      monthlyIncome: 10_000,
      targetSavings: 0,
      accumulatedSavings: 5_000,
      expenses: [
        { name: "Savings", quantity: 2, unitCost: 600, checked: true },
        { name: "Savings", quantity: 1, unitCost: 900, checked: false },
      ],
    });
    expect(totals.savingsWithdrawals).toBe(1_200);
    expect(totals.accumulatedSavings).toBe(3_800);
  });

  it("uses accumulated overall balance when actual expenses exceed income", () => {
    const totals = calculateTrackerTotals({
      monthlyIncome: 1_000,
      targetSavings: 0,
      accumulatedOverallBalance: 400,
      expenses: [{ name: "Emergency", quantity: 1, unitCost: 1_500, checked: true }],
    });
    expect(totals.incomeOverage).toBe(500);
    expect(totals.overallBalanceDeduction).toBe(400);
    expect(totals.accumulatedOverallBalance).toBe(0);
  });

  it("only deducts the expense amount above income", () => {
    const totals = calculateTrackerTotals({
      monthlyIncome: 1_000,
      targetSavings: 0,
      accumulatedOverallBalance: 800,
      expenses: [{ name: "Emergency", quantity: 1, unitCost: 1_300, checked: true }],
    });
    expect(totals.overallBalanceDeduction).toBe(300);
    expect(totals.accumulatedOverallBalance).toBe(500);
  });
});
