import { calculateTrackerTotals } from "./calculations";
import { getNextMonth } from "./month";

export function rollTrackerToNextMonth(tracker) {
  const nextMonth = getNextMonth(tracker.currentMonth);
  if (!nextMonth) return tracker;

  const totals = calculateTrackerTotals(tracker);
  return {
    ...tracker,
    currentMonth: nextMonth,
    monthLocked: true,
    previousMonthBalance: totals.remainingBudget,
    accumulatedOverallBalance:
      totals.accumulatedOverallBalance + Math.max(totals.remainingBudget, 0),
    accumulatedSavings: totals.accumulatedSavings + totals.targetSavings,
    expenses: tracker.expenses.map((expense) => ({ ...expense, checked: false })),
  };
}
