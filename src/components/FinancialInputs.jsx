import { formatCurrencyInput, pesosToCentavos } from "../utils/currency";
import { MAX_MONEY_CENTAVOS } from "../constants/tracker";

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

export function FinancialInputs({ tracker, onChange }) {
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
      <div className="money-fields">
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
      </div>
      {savingsWarning && <p className="inline-warning" role="status">Your savings target is higher than your monthly income.</p>}
    </section>
  );
}
