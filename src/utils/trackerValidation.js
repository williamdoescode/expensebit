import {
  MAX_EXPENSES,
  MAX_MONEY_CENTAVOS,
  MAX_NAME_LENGTH,
  MAX_QUANTITY,
  SUPPORTED_TRACKER_VERSIONS,
  TRACKER_VERSION,
} from "../constants/tracker";
import { isValidMonth } from "./month";

function validMoney(value, allowEmpty = true) {
  if (allowEmpty && value === null) return true;
  return Number.isSafeInteger(value) && value >= 0 && value <= MAX_MONEY_CENTAVOS;
}

function validId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

function validSignedMoney(value) {
  return Number.isSafeInteger(value) && Math.abs(value) <= MAX_MONEY_CENTAVOS;
}

export function validateTrackerState(candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new Error("Tracker data is not an object.");
  }
  if (!SUPPORTED_TRACKER_VERSIONS.includes(candidate.version)) {
    throw new Error("This tracker version is not supported.");
  }
  if (!validMoney(candidate.monthlyIncome) || !validMoney(candidate.targetSavings)) {
    throw new Error("Tracker totals contain invalid values.");
  }
  const currentMonth = candidate.currentMonth ?? "";
  const monthLocked = candidate.monthLocked ?? false;
  const previousMonthBalance = candidate.previousMonthBalance ?? 0;
  const accumulatedOverallBalance = candidate.accumulatedOverallBalance ?? 0;
  const accumulatedSavings = candidate.accumulatedSavings ?? 0;
  if (!isValidMonth(currentMonth)) throw new Error("The tracker month is invalid.");
  if (typeof monthLocked !== "boolean" || (monthLocked && !currentMonth)) {
    throw new Error("The tracker month lock is invalid.");
  }
  if (!validSignedMoney(previousMonthBalance) || !validSignedMoney(accumulatedSavings)) {
    throw new Error("Tracker carry-over values are invalid.");
  }
  if (!validMoney(accumulatedOverallBalance, false)) {
    throw new Error("The accumulated overall balance is invalid.");
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
    if (expense.checked !== undefined && typeof expense.checked !== "boolean") {
      throw new Error("An expense completion status is invalid.");
    }
    return {
      id: expense.id,
      name,
      quantity: expense.quantity,
      unitCost: expense.unitCost,
      checked: expense.checked ?? false,
    };
  });

  return {
    version: TRACKER_VERSION,
    currentMonth,
    monthLocked,
    monthlyIncome: candidate.monthlyIncome,
    targetSavings: candidate.targetSavings,
    previousMonthBalance,
    accumulatedOverallBalance,
    accumulatedSavings,
    expenses,
  };
}
