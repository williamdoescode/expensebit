export const TRANSFER_DIRECTIONS = Object.freeze({
  OVERALL_TO_SAVINGS: "overall-to-savings",
  SAVINGS_TO_OVERALL: "savings-to-overall",
});

export function transferBalance(tracker, totals, direction, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Enter a transfer amount greater than zero.");
  }

  if (direction === TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS) {
    if (totals.accumulatedOverallBalance <= 0 || amount > totals.accumulatedOverallBalance) {
      throw new Error("The transfer exceeds the available overall balance.");
    }
    return {
      ...tracker,
      accumulatedOverallBalance: tracker.accumulatedOverallBalance - amount,
      accumulatedSavings: tracker.accumulatedSavings + amount,
    };
  }

  if (direction === TRANSFER_DIRECTIONS.SAVINGS_TO_OVERALL) {
    if (totals.accumulatedSavings <= 0 || amount > totals.accumulatedSavings) {
      throw new Error("The transfer exceeds the available savings balance.");
    }
    return {
      ...tracker,
      accumulatedOverallBalance: tracker.accumulatedOverallBalance + amount,
      accumulatedSavings: tracker.accumulatedSavings - amount,
    };
  }

  throw new Error("The transfer direction is invalid.");
}
