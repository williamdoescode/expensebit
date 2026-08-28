export const TRACKER_VERSION = 5;
export const HASH_PREFIX = "xsd:";
export const SUPPORTED_TRACKER_VERSIONS = [1, 2, 3, 4, 5];
export const MAX_EXPENSES = 20;
export const MAX_NAME_LENGTH = 100;
export const MAX_MONEY_CENTAVOS = 100_000_000_000_000;
export const MAX_QUANTITY = 1_000_000;
export const LARGE_LINK_LENGTH = 6_000;

export const EMPTY_TRACKER = Object.freeze({
  version: TRACKER_VERSION,
  currentMonth: "",
  monthLocked: false,
  monthlyIncome: null,
  targetSavings: null,
  previousMonthBalance: 0,
  accumulatedOverallBalance: 0,
  accumulatedSavings: 0,
  expenses: [],
});
