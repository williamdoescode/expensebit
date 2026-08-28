import { describe, expect, it } from "vitest";
import { TRANSFER_DIRECTIONS, transferBalance } from "./balanceTransfer";

const tracker = { accumulatedOverallBalance: 10_000, accumulatedSavings: 5_000 };
const totals = { accumulatedOverallBalance: 8_000, accumulatedSavings: 4_000 };

describe("balance transfers", () => {
  it("transfers from overall balance to savings", () => {
    expect(transferBalance(tracker, totals, TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS, 3_000)).toMatchObject({
      accumulatedOverallBalance: 7_000,
      accumulatedSavings: 8_000,
    });
  });

  it("transfers from savings to overall balance", () => {
    expect(transferBalance(tracker, totals, TRANSFER_DIRECTIONS.SAVINGS_TO_OVERALL, 2_000)).toMatchObject({
      accumulatedOverallBalance: 12_000,
      accumulatedSavings: 3_000,
    });
  });

  it.each([
    ["zero amount", TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS, 0, totals],
    ["amount above source", TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS, 8_001, totals],
    ["empty overall source", TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS, 1, { ...totals, accumulatedOverallBalance: 0 }],
    ["empty savings source", TRANSFER_DIRECTIONS.SAVINGS_TO_OVERALL, 1, { ...totals, accumulatedSavings: 0 }],
  ])("rejects %s", (_, direction, amount, currentTotals) => {
    expect(() => transferBalance(tracker, currentTotals, direction, amount)).toThrow();
  });
});
