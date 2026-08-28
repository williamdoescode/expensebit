import { describe, expect, it } from "vitest";
import { MAX_MONEY_CENTAVOS } from "../constants/tracker";
import { validateTrackerState } from "./trackerValidation";

const valid = {
  version: 5,
  currentMonth: "2026-08",
  monthLocked: true,
  monthlyIncome: null,
  targetSavings: 0,
  previousMonthBalance: -10_000,
  accumulatedOverallBalance: 25_000,
  accumulatedSavings: 50_000,
  expenses: [{ id: "item_1", name: " Rent ", quantity: 1, unitCost: 100_000, checked: true }],
};

describe("tracker validation", () => {
  it("returns a sanitized tracker", () => {
    expect(validateTrackerState(valid).expenses[0].name).toBe("Rent");
    expect(validateTrackerState(valid).expenses[0].checked).toBe(true);
  });

  it("defaults legacy completion state to unchecked", () => {
    const legacy = { ...valid, version: 1, monthLocked: undefined, expenses: [{ ...valid.expenses[0], checked: undefined }] };
    expect(validateTrackerState(legacy)).toMatchObject({ version: 5, monthLocked: false, expenses: [{ checked: false }] });
  });

  it.each([
    ["negative money", { ...valid, monthlyIncome: -1 }],
    ["non-integer money", { ...valid, monthlyIncome: 1.5 }],
    ["extreme money", { ...valid, monthlyIncome: MAX_MONEY_CENTAVOS + 1 }],
    ["missing expense property", { ...valid, expenses: [{ id: "x", name: "Food", quantity: 1 }] }],
    ["duplicate IDs", { ...valid, expenses: [valid.expenses[0], valid.expenses[0]] }],
    ["long name", { ...valid, expenses: [{ ...valid.expenses[0], name: "x".repeat(101) }] }],
    ["invalid checked state", { ...valid, expenses: [{ ...valid.expenses[0], checked: 1 }] }],
    ["invalid month", { ...valid, currentMonth: "2026-13" }],
    ["invalid prior balance", { ...valid, previousMonthBalance: 1.5 }],
    ["negative overall balance", { ...valid, accumulatedOverallBalance: -1 }],
    ["invalid month lock", { ...valid, monthLocked: "yes" }],
    ["locked empty month", { ...valid, currentMonth: "", monthLocked: true }],
  ])("rejects %s", (_, candidate) => {
    expect(() => validateTrackerState(candidate)).toThrow();
  });
});
