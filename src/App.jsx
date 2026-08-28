import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { FinancialInputs } from "./components/FinancialInputs";
import { ExpenseTable } from "./components/ExpenseTable";
import { FinancialSummary } from "./components/FinancialSummary";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { SaveLinkPanel } from "./components/SaveLinkPanel";
import { LARGE_LINK_LENGTH, MAX_EXPENSES } from "./constants/tracker";
import { useUrlTrackerState } from "./hooks/useUrlTrackerState";
import { calculateTrackerTotals } from "./utils/calculations";
import { rollTrackerToNextMonth } from "./utils/monthlyRollover";
import { transferBalance } from "./utils/balanceTransfer";

function createExpense() {
  return { id: crypto.randomUUID(), name: "", quantity: 1, unitCost: null, checked: false };
}

function hasTrackerData(tracker) {
  return tracker.currentMonth !== "" ||
    tracker.monthlyIncome !== null ||
    tracker.targetSavings !== null ||
    tracker.previousMonthBalance !== 0 ||
    tracker.accumulatedOverallBalance !== 0 ||
    tracker.accumulatedSavings !== 0 ||
    tracker.expenses.length > 0;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("Clipboard access was denied.");
}

export default function App() {
  const { tracker, setTracker, decodeError, resetTracker, writeUrl } = useUrlTrackerState();
  const [copyStatus, setCopyStatus] = useState("idle");
  const [dialogAction, setDialogAction] = useState("");
  const [linkIsLarge, setLinkIsLarge] = useState(false);
  const newRowRef = useRef(null);
  const copyTimerRef = useRef();
  const totals = useMemo(() => calculateTrackerTotals(tracker), [tracker]);

  const addExpense = () => {
    if (tracker.expenses.length >= MAX_EXPENSES) return;
    setTracker({ ...tracker, expenses: [...tracker.expenses, createExpense()] });
    window.requestAnimationFrame(() => newRowRef.current?.focus());
  };

  const updateExpense = (updated) => {
    setTracker({ ...tracker, expenses: tracker.expenses.map((expense) => expense.id === updated.id ? updated : expense) });
  };

  const requestNewTracker = () => {
    if (hasTrackerData(tracker)) setDialogAction("new");
    else resetTracker();
  };

  const copyLink = async () => {
    const url = writeUrl(tracker);
    setLinkIsLarge(url.length > LARGE_LINK_LENGTH);
    try {
      await copyText(url);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopyStatus("idle"), 2200);
  };

  return (
    <div className="app-shell">
      <Header onSave={copyLink} onNew={requestNewTracker} copyStatus={copyStatus} />
      <main>
        {decodeError && (
          <div className="error-banner" role="alert">
            <div><strong>We couldn’t open this tracker.</strong><span>{decodeError} You can start with a clean tracker instead.</span></div>
            <button type="button" onClick={resetTracker}>Start fresh</button>
          </div>
        )}
        {linkIsLarge && (
          <div className="notice-banner" role="status">This tracker creates a long link. Some messaging apps may shorten it, so check the full link after sharing.</div>
        )}

        <FinancialInputs
          tracker={tracker}
          totals={totals}
          onChange={setTracker}
          onTransfer={(direction, amount) => setTracker(transferBalance(tracker, totals, direction, amount))}
        />
        <div className="workspace-grid">
          <ExpenseTable
            expenses={tracker.expenses}
            onAdd={addExpense}
            onUpdate={updateExpense}
            onDelete={(id) => setTracker({ ...tracker, expenses: tracker.expenses.filter((expense) => expense.id !== id) })}
            onResetChecked={() => setTracker({
              ...tracker,
              expenses: tracker.expenses.map((expense) => ({ ...expense, checked: false })),
            })}
            newRowRef={newRowRef}
            atLimit={tracker.expenses.length >= MAX_EXPENSES}
          />
          <div className="summary-column">
            <FinancialSummary tracker={tracker} totals={totals} onNextMonth={() => setDialogAction("next")} />
            <SaveLinkPanel onSave={copyLink} copyStatus={copyStatus} />
          </div>
        </div>
      </main>
      <footer>
        <p><strong>The link is the save file.</strong> Xpensed stores nothing on a server or this device.</p>
        <p>Anyone with the full link can view its financial information.</p>
      </footer>

      <ConfirmDialog
        open={Boolean(dialogAction)}
        title={dialogAction === "next" ? "Proceed to the next month?" : "Start a new tracker?"}
        message={dialogAction === "next"
          ? "This will finalize the current balances, advance the month, preserve every expense row, and reset all checks. The Date can no longer be modified"
          : "Your current figures will be removed from this page and its URL."}
        confirmLabel={dialogAction === "next" ? "Proceed to next month" : "Start new tracker"}
        onCancel={() => setDialogAction("")}
        onConfirm={() => {
          if (dialogAction === "next") setTracker(rollTrackerToNextMonth(tracker));
          else resetTracker();
          setDialogAction("");
        }}
      />
    </div>
  );
}
