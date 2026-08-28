import { useEffect, useState } from "react";
import { formatCurrency, formatCurrencyInput, pesosToCentavos } from "../utils/currency";
import { TRANSFER_DIRECTIONS } from "../utils/balanceTransfer";

const OPTIONS = [
  {
    value: TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS,
    label: "Overall balance → Savings",
  },
  {
    value: TRANSFER_DIRECTIONS.SAVINGS_TO_OVERALL,
    label: "Savings → Overall balance",
  },
];

export function BalanceTransfer({ totals, onTransfer }) {
  const [direction, setDirection] = useState(TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS);
  const [amount, setAmount] = useState(null);
  const [status, setStatus] = useState("idle");
  const available = direction === TRANSFER_DIRECTIONS.OVERALL_TO_SAVINGS
    ? totals.accumulatedOverallBalance
    : totals.accumulatedSavings;
  const canTransfer = available > 0 && amount > 0 && amount <= available;

  useEffect(() => {
    if (status !== "success") return undefined;
    const timer = window.setTimeout(() => setStatus("idle"), 1800);
    return () => window.clearTimeout(timer);
  }, [status]);

  const selectDirection = (nextDirection) => {
    setDirection(nextDirection);
    setAmount(null);
    setStatus("idle");
  };

  const submitTransfer = (event) => {
    event.preventDefault();
    if (!canTransfer) {
      setStatus("error");
      return;
    }
    onTransfer(direction, amount);
    setAmount(null);
    setStatus("success");
  };

  return (
    <section className="transfer-panel" aria-labelledby="transfer-heading">
      <div className="transfer-heading">
        <div>
          <span className="eyebrow">Move funds</span>
          <h2 id="transfer-heading">Transfer between balances</h2>
        </div>
        <p>Available from source: <strong>{formatCurrency(available)}</strong></p>
      </div>
      <div className="transfer-directions" aria-label="Transfer direction">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={direction === option.value ? "transfer-direction-active" : ""}
            aria-pressed={direction === option.value}
            onClick={() => selectDirection(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <form className="transfer-form" onSubmit={submitTransfer}>
        <div>
          <label htmlFor="transfer-amount">Amount to transfer</label>
          <div className="transfer-input-wrap">
            <span aria-hidden="true">₱</span>
            <input
              id="transfer-amount"
              type="number"
              inputMode="decimal"
              min="0.01"
              max={Math.max(available, 0) / 100}
              step="0.01"
              placeholder="0"
              value={formatCurrencyInput(amount)}
              disabled={available <= 0}
              onChange={(event) => {
                setAmount(pesosToCentavos(event.target.value));
                setStatus("idle");
              }}
            />
          </div>
        </div>
        <button className="button button-primary transfer-button" type="submit" disabled={!canTransfer}>Transfer amount</button>
      </form>
      <p className={`transfer-status ${status !== "idle" ? "transfer-status-visible" : ""}`} role="status" aria-live="polite">
        {status === "success"
          ? "Transfer complete. Save as Link when you’re ready to preserve it."
          : status === "error"
            ? "Enter an amount within the available source balance."
            : available <= 0
              ? "This source balance must be greater than zero before transferring."
              : ""}
      </p>
    </section>
  );
}
