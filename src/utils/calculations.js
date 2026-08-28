export function getRowTotal({ quantity, unitCost }) {
  if (!Number.isFinite(quantity) || !Number.isInteger(unitCost)) return 0;
  return Math.round(quantity * unitCost);
}

export function calculateTrackerTotals(tracker) {
  const monthlyIncome = tracker.monthlyIncome ?? 0;
  const targetSavings = tracker.targetSavings ?? 0;
  const availableBudget = monthlyIncome - targetSavings;
  const idealExpenses = tracker.expenses.reduce(
    (sum, expense) => sum + getRowTotal(expense),
    0,
  );
  const actualExpenses = tracker.expenses.reduce(
    (sum, expense) => sum + (expense.checked ? getRowTotal(expense) : 0),
    0,
  );
  const savingsWithdrawals = tracker.expenses.reduce(
    (sum, expense) => sum + (
      expense.checked && (expense.name ?? "").trim().toLocaleLowerCase() === "savings"
        ? getRowTotal(expense)
        : 0
    ),
    0,
  );
  const incomeOverage = Math.max(actualExpenses - monthlyIncome, 0);
  const storedOverallBalance = tracker.accumulatedOverallBalance ?? 0;
  const overallBalanceDeduction = Math.min(storedOverallBalance, incomeOverage);

  return {
    monthlyIncome,
    targetSavings,
    availableBudget,
    idealExpenses,
    actualExpenses,
    incomeOverage,
    overallBalanceDeduction,
    accumulatedOverallBalance: storedOverallBalance - overallBalanceDeduction,
    savingsWithdrawals,
    accumulatedSavings: (tracker.accumulatedSavings ?? 0) - savingsWithdrawals,
    remainingBudget: availableBudget - actualExpenses,
  };
}
