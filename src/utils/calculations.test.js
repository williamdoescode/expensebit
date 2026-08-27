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
      expenses: [
        { quantity: 2, unitCost: 120_000 },
        { quantity: 1, unitCost: 169_900 },
      ],
    })).toEqual({
      monthlyIncome: 3_500_000,
      targetSavings: 800_000,
      availableBudget: 2_700_000,
      totalExpenses: 409_900,
      remainingBudget: 2_290_100,
    });
  });

  it("reports a negative remaining budget", () => {
    const totals = calculateTrackerTotals({ monthlyIncome: 1_000, targetSavings: 0, expenses: [{ quantity: 2, unitCost: 600 }] });
    expect(totals.remainingBudget).toBe(-200);
  });
});
