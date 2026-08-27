import { describe, expect, it } from "vitest";
import { MAX_MONEY_CENTAVOS } from "../constants/tracker";
import { validateTrackerState } from "./trackerValidation";

const valid = {
  version: 1,
  monthlyIncome: null,
  targetSavings: 0,
  expenses: [{ id: "item_1", name: " Rent ", quantity: 1, unitCost: 100_000 }],
};

describe("tracker validation", () => {
  it("returns a sanitized tracker", () => {
    expect(validateTrackerState(valid).expenses[0].name).toBe("Rent");
  });

  it.each([
    ["negative money", { ...valid, monthlyIncome: -1 }],
    ["non-integer money", { ...valid, monthlyIncome: 1.5 }],
    ["extreme money", { ...valid, monthlyIncome: MAX_MONEY_CENTAVOS + 1 }],
    ["missing expense property", { ...valid, expenses: [{ id: "x", name: "Food", quantity: 1 }] }],
    ["duplicate IDs", { ...valid, expenses: [valid.expenses[0], valid.expenses[0]] }],
    ["long name", { ...valid, expenses: [{ ...valid.expenses[0], name: "x".repeat(101) }] }],
  ])("rejects %s", (_, candidate) => {
    expect(() => validateTrackerState(candidate)).toThrow();
  });
});
