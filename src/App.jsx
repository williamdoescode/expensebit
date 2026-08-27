import { useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { FinancialInputs } from "./components/FinancialInputs";
import { ExpenseTable } from "./components/ExpenseTable";
import { FinancialSummary } from "./components/FinancialSummary";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { LARGE_LINK_LENGTH, MAX_EXPENSES, TRACKER_VERSION } from "./constants/tracker";
import { useUrlTrackerState } from "./hooks/useUrlTrackerState";
import { calculateTrackerTotals } from "./utils/calculations";

function createExpense() {
  return { id: crypto.randomUUID(), name: "", quantity: 1, unitCost: null };
}

function hasTrackerData(tracker) {
  return tracker.monthlyIncome !== null || tracker.targetSavings !== null || tracker.expenses.length > 0;
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
      <Header onCopy={copyLink} onNew={requestNewTracker} copyStatus={copyStatus} />
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

        <FinancialInputs tracker={tracker} onChange={setTracker} />
        <div className="workspace-grid">
          <ExpenseTable
            expenses={tracker.expenses}
            onAdd={addExpense}
            onUpdate={updateExpense}
            onDelete={(id) => setTracker({ ...tracker, expenses: tracker.expenses.filter((expense) => expense.id !== id) })}
            onClear={() => setDialogAction("clear")}
            newRowRef={newRowRef}
            atLimit={tracker.expenses.length >= MAX_EXPENSES}
          />
          <FinancialSummary totals={totals} />
        </div>
      </main>
      <footer>
        <p><strong>The link is the save file.</strong> ExpenseBit stores nothing on a server or this device.</p>
        <p>Anyone with the full link can view its financial information.</p>
      </footer>

      <ConfirmDialog
        open={Boolean(dialogAction)}
        title={dialogAction === "new" ? "Start a new tracker?" : "Clear every expense?"}
        message={dialogAction === "new" ? "Your current figures will be removed from this page and its URL." : "This removes all expense rows. Your income and savings target will stay."}
        confirmLabel={dialogAction === "new" ? "Start new tracker" : "Clear expenses"}
        onCancel={() => setDialogAction("")}
        onConfirm={() => {
          if (dialogAction === "new") resetTracker();
          else setTracker({ ...tracker, version: TRACKER_VERSION, expenses: [] });
          setDialogAction("");
        }}
      />
    </div>
  );
}
