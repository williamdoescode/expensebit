import { formatCurrencyInput, pesosToCentavos } from "../utils/currency";
import { MAX_MONEY_CENTAVOS } from "../constants/tracker";
import { formatMonth, getPreviousMonth } from "../utils/month";
import { AnimatedCurrency } from "./AnimatedCurrency";
import { BalanceTransfer } from "./BalanceTransfer";

function MoneyInput({ id, label, value, hint, onChange }) {
  return (
    <div className="money-field">
      <label htmlFor={id}>{label}</label>
      <div className="money-input-wrap">
        <span aria-hidden="true">₱</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          max={MAX_MONEY_CENTAVOS / 100}
          step="0.01"
          placeholder="0"
          value={formatCurrencyInput(value)}
          onChange={(event) => onChange(pesosToCentavos(event.target.value))}
        />
      </div>
      <p>{hint}</p>
    </div>
  );
}

function getStatValueClass(value) {
  if (value < 0) return "stat-negative";
  if (value > 0) return "stat-positive";
  return "";
}

export function FinancialInputs({ tracker, totals, onChange, onTransfer }) {
  const savingsWarning =
    tracker.monthlyIncome !== null && tracker.targetSavings !== null && tracker.targetSavings > tracker.monthlyIncome;

  return (
    <section className="financial-panel" aria-labelledby="plan-heading">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Monthly plan</span>
          <h1 id="plan-heading">Build a budget that adds up.</h1>
        </div>
        <p>Enter what comes in, what you want to keep, and where the rest goes.</p>
      </div>
      <div className="month-selector-row">
        <div className="month-selector-card">
          <span className="month-card-label">Month of year</span>
          {tracker.monthLocked ? (
            <p className="locked-month">{formatMonth(tracker.currentMonth)}</p>
          ) : (
            <>
              <label className="sr-only" htmlFor="month-of-year">Month of year</label>
              <div className="month-picker-wrap">
                <input
                  id="month-of-year"
                  className="month-input"
                  type="month"
                  value={tracker.currentMonth}
                  onChange={(event) => onChange({ ...tracker, currentMonth: event.target.value })}
                />
              </div>
              <p>Select the starting month for this tracker</p>
            </>
          )}
        </div>
      </div>
      <div className="balance-overview-row">
        <div className="rollover-stat">
          <span>Remaining balance for {formatMonth(getPreviousMonth(tracker.currentMonth))}</span>
          <strong className={getStatValueClass(tracker.previousMonthBalance)}>
            <AnimatedCurrency value={tracker.previousMonthBalance} />
          </strong>
        </div>
        <div className="rollover-stat">
          <span>Accumulated overall balance</span>
          <strong className={getStatValueClass(totals.accumulatedOverallBalance)}>
            <AnimatedCurrency value={totals.accumulatedOverallBalance} />
          </strong>
          {totals.overallBalanceDeduction > 0 && (
            <small><AnimatedCurrency value={totals.overallBalanceDeduction} /> used for expenses above income</small>
          )}
        </div>
        <div className="rollover-stat">
          <span>Accumulated savings</span>
          <strong className={getStatValueClass(totals.accumulatedSavings)}>
            <AnimatedCurrency value={totals.accumulatedSavings} />
          </strong>
          <small>Checked “Savings” rows are deducted</small>
        </div>
      </div>
      <div className="money-transfer-row">
        <MoneyInput
          id="monthly-income"
          label="Monthly income"
          value={tracker.monthlyIncome}
          hint="Your expected take-home income"
          onChange={(monthlyIncome) => onChange({ ...tracker, monthlyIncome })}
        />
        <MoneyInput
          id="target-savings"
          label="Target savings"
          value={tracker.targetSavings}
          hint="The amount you plan to set aside"
          onChange={(targetSavings) => onChange({ ...tracker, targetSavings })}
        />
        <BalanceTransfer totals={totals} onTransfer={onTransfer} />
      </div>
      {savingsWarning && <p className="inline-warning" role="status">Your savings target is higher than your monthly income.</p>}
    </section>
  );
}
