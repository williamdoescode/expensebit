export function getRowTotal({ quantity, unitCost }) {
  if (!Number.isFinite(quantity) || !Number.isInteger(unitCost)) return 0;
  return Math.round(quantity * unitCost);
}

export function calculateTrackerTotals(tracker) {
  const monthlyIncome = tracker.monthlyIncome ?? 0;
  const targetSavings = tracker.targetSavings ?? 0;
  const availableBudget = monthlyIncome - targetSavings;
  const totalExpenses = tracker.expenses.reduce(
    (sum, expense) => sum + getRowTotal(expense),
    0,
  );

  return {
    monthlyIncome,
    targetSavings,
    availableBudget,
    totalExpenses,
    remainingBudget: availableBudget - totalExpenses,
  };
}
