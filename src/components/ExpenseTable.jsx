import { forwardRef } from "react";
import { MAX_NAME_LENGTH, MAX_QUANTITY } from "../constants/tracker";
import { formatCurrency, formatCurrencyInput, pesosToCentavos } from "../utils/currency";
import { getRowTotal } from "../utils/calculations";

const ExpenseRow = forwardRef(function ExpenseRow({ expense, onChange, onDelete }, ref) {
  return (
    <div className="expense-row" role="row">
      <div className="expense-cell expense-name" role="cell" data-label="Expense">
        <label className="sr-only" htmlFor={`name-${expense.id}`}>Expense name</label>
        <input
          ref={ref}
          id={`name-${expense.id}`}
          type="text"
          maxLength={MAX_NAME_LENGTH}
          placeholder="e.g. Groceries"
          value={expense.name}
          onChange={(event) => onChange({ ...expense, name: event.target.value })}
        />
      </div>
      <div className="expense-cell quantity" role="cell" data-label="Quantity">
        <label className="sr-only" htmlFor={`quantity-${expense.id}`}>Quantity for {expense.name || "expense"}</label>
        <input
          id={`quantity-${expense.id}`}
          type="number"
          inputMode="decimal"
          min="0.01"
          max={MAX_QUANTITY}
          step="any"
          value={expense.quantity}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (Number.isFinite(value) && value > 0 && value <= MAX_QUANTITY) onChange({ ...expense, quantity: value });
          }}
        />
      </div>
      <div className="expense-cell unit-cost" role="cell" data-label="Unit cost">
        <label className="sr-only" htmlFor={`cost-${expense.id}`}>Unit cost for {expense.name || "expense"}</label>
        <div className="compact-money-input">
          <span aria-hidden="true">₱</span>
          <input
            id={`cost-${expense.id}`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="0"
            value={formatCurrencyInput(expense.unitCost)}
            onChange={(event) => onChange({ ...expense, unitCost: pesosToCentavos(event.target.value) })}
          />
        </div>
      </div>
      <div className="expense-cell row-total" role="cell" data-label="Total">{formatCurrency(getRowTotal(expense))}</div>
      <div className="expense-cell row-actions" role="cell">
        <button className="delete-button" type="button" onClick={onDelete} aria-label={`Delete ${expense.name || "expense"}`}>×</button>
      </div>
    </div>
  );
});

export function ExpenseTable({ expenses, onAdd, onUpdate, onDelete, onClear, newRowRef, atLimit }) {
  return (
    <section className="expenses-section" aria-labelledby="expenses-heading">
      <div className="expenses-heading-row">
        <div>
          <span className="eyebrow">Outgoings</span>
          <h2 id="expenses-heading">Expenses</h2>
        </div>
        {expenses.length > 0 && <button className="text-button" type="button" onClick={onClear}>Clear all</button>}
      </div>

      {expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">+</div>
          <h3>No expenses added yet</h3>
          <p>Add your first expense to start seeing where your budget goes.</p>
        </div>
      ) : (
        <div className="expense-table" role="table" aria-label="Monthly expenses">
          <div className="expense-header" role="row">
            <span role="columnheader">Expense</span><span role="columnheader">Quantity</span>
            <span role="columnheader">Unit cost</span><span role="columnheader">Total</span>
            <span role="columnheader" className="sr-only">Actions</span>
          </div>
          {expenses.map((expense, index) => (
            <ExpenseRow
              key={expense.id}
              ref={index === expenses.length - 1 ? newRowRef : null}
              expense={expense}
              onChange={onUpdate}
              onDelete={() => onDelete(expense.id)}
            />
          ))}
        </div>
      )}

      <button className="add-expense-button" type="button" onClick={onAdd} disabled={atLimit}>
        <span aria-hidden="true">+</span> {atLimit ? "100 expense limit reached" : "Add expense"}
      </button>
    </section>
  );
}
