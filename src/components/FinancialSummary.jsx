import { AnimatedCurrency } from "./AnimatedCurrency";

export function FinancialSummary({ tracker, totals, onNextMonth }) {
  const overBudget = totals.remainingBudget < 0;
  return (
    <aside className="summary" aria-labelledby="summary-heading">
      <div>
        <span className="eyebrow eyebrow-light">At a glance</span>
        <h2 id="summary-heading">Your monthly picture</h2>
      </div>
      <dl className="summary-list">
        <div><dt>Monthly income</dt><dd><AnimatedCurrency value={totals.monthlyIncome} /></dd></div>
        <div><dt>Target savings</dt><dd><AnimatedCurrency value={totals.targetSavings} /></dd></div>
        <div className="summary-subtotal"><dt>Available budget</dt><dd><AnimatedCurrency value={totals.availableBudget} /></dd></div>
        <div><dt>Ideal expenses</dt><dd><AnimatedCurrency value={totals.idealExpenses} /></dd></div>
        <div><dt>Actual expenses</dt><dd><AnimatedCurrency value={totals.actualExpenses} /></dd></div>
      </dl>
      <div className={`remaining ${overBudget ? "remaining-negative" : ""}`}>
        <div><span>{overBudget ? "Over budget" : "Remaining budget"}</span><small>{overBudget ? "Completed expenses exceed your available budget" : "Left after savings and completed expenses"}</small></div>
        <strong><AnimatedCurrency value={totals.remainingBudget} /></strong>
      </div>
      <button className="next-month-button" type="button" onClick={onNextMonth} disabled={!tracker.currentMonth}>
        Proceed to next month <span aria-hidden="true">→</span>
      </button>
      {!tracker.currentMonth && <p className="next-month-hint">Select a month before proceeding.</p>}
    </aside>
  );
}
