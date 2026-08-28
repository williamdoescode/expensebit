import { describe, expect, it } from "vitest";
import { rollTrackerToNextMonth } from "./monthlyRollover";

describe("monthly rollover", () => {
  it("carries balances, adds Monthly Savings, advances the month, and resets checks", () => {
    const tracker = {
      version: 5,
      currentMonth: "2026-12",
      monthLocked: false,
      monthlyIncome: 100_000,
      targetSavings: 20_000,
      previousMonthBalance: 0,
      accumulatedOverallBalance: 10_000,
      accumulatedSavings: 50_000,
      expenses: [
        { id: "a", name: "Food", quantity: 1, unitCost: 30_000, checked: true },
        { id: "b", name: "Savings", quantity: 1, unitCost: 5_000, checked: true },
        { id: "c", name: "Rent", quantity: 1, unitCost: 10_000, checked: false },
      ],
    };

    const rolled = rollTrackerToNextMonth(tracker);
    expect(rolled.currentMonth).toBe("2027-01");
    expect(rolled.monthLocked).toBe(true);
    expect(rolled.previousMonthBalance).toBe(45_000);
    expect(rolled.accumulatedOverallBalance).toBe(55_000);
    expect(rolled.accumulatedSavings).toBe(65_000);
    expect(rolled.expenses.every((expense) => !expense.checked)).toBe(true);
    expect(rolled.expenses.map((expense) => expense.name)).toEqual(["Food", "Savings", "Rent"]);
  });

  it("does nothing without a selected month", () => {
    const tracker = { currentMonth: "", expenses: [] };
    expect(rollTrackerToNextMonth(tracker)).toBe(tracker);
  });
});
