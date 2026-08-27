import {
  MAX_EXPENSES,
  MAX_MONEY_CENTAVOS,
  MAX_NAME_LENGTH,
  MAX_QUANTITY,
  TRACKER_VERSION,
} from "../constants/tracker";

function validMoney(value, allowEmpty = true) {
  if (allowEmpty && value === null) return true;
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_MONEY_CENTAVOS;
}

function validId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

export function validateTrackerState(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Tracker data is not an object.");
  }
  if (candidate.version !== TRACKER_VERSION) {
    throw new Error("This tracker version is not supported.");
  }
  if (!validMoney(candidate.monthlyIncome) || !validMoney(candidate.targetSavings)) {
    throw new Error("Tracker totals contain invalid values.");
  }
  if (!Array.isArray(candidate.expenses) || candidate.expenses.length > MAX_EXPENSES) {
    throw new Error("Tracker contains too many expense rows.");
  }

  const ids = new Set();
  const expenses = candidate.expenses.map((expense) => {
    if (!expense || typeof expense !== "object" || Array.isArray(expense)) {
      throw new Error("An expense row is invalid.");
    }
    const name = typeof expense.name === "string" ? expense.name.trim() : "";
    if (name.length > MAX_NAME_LENGTH) throw new Error("An expense name is too long.");
    if (!validId(expense.id) || ids.has(expense.id)) throw new Error("An expense ID is invalid.");
    if (
      !Number.isFinite(expense.quantity) ||
      expense.quantity <= 0 ||
      expense.quantity > MAX_QUANTITY
    ) {
      throw new Error("An expense quantity is invalid.");
    }
    if (!validMoney(expense.unitCost)) throw new Error("An expense cost is invalid.");
    ids.add(expense.id);
    return { id: expense.id, name, quantity: expense.quantity, unitCost: expense.unitCost };
  });

  return {
    version: TRACKER_VERSION,
    monthlyIncome: candidate.monthlyIncome,
    targetSavings: candidate.targetSavings,
    expenses,
  };
}
