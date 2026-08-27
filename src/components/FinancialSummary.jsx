import { formatCurrency } from "../utils/currency";

export function FinancialSummary({ totals }) {
  const overBudget = totals.remainingBudget < 0;
  return (
    <aside className="summary" aria-labelledby="summary-heading">
      <div>
        <span className="eyebrow eyebrow-light">At a glance</span>
        <h2 id="summary-heading">Your monthly picture</h2>
      </div>
      <dl className="summary-list">
        <div><dt>Monthly income</dt><dd>{formatCurrency(totals.monthlyIncome)}</dd></div>
        <div><dt>Target savings</dt><dd>− {formatCurrency(totals.targetSavings)}</dd></div>
        <div className="summary-subtotal"><dt>Available budget</dt><dd>{formatCurrency(totals.availableBudget)}</dd></div>
        <div><dt>Total expenses</dt><dd>− {formatCurrency(totals.totalExpenses)}</dd></div>
      </dl>
      <div className={`remaining ${overBudget ? "remaining-negative" : ""}`}>
        <div><span>{overBudget ? "Over budget" : "Remaining budget"}</span><small>{overBudget ? "Expenses exceed your available budget" : "Left after savings and expenses"}</small></div>
        <strong>{formatCurrency(totals.remainingBudget)}</strong>
      </div>
    </aside>
  );
}
