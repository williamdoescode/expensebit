export const TRACKER_VERSION = 1;
export const HASH_PREFIX = `v${TRACKER_VERSION}:`;
export const MAX_EXPENSES = 100;
export const MAX_NAME_LENGTH = 100;
export const MAX_MONEY_CENTAVOS = 100_000_000_000_000;
export const MAX_QUANTITY = 1_000_000;
export const LARGE_LINK_LENGTH = 6_000;
export const URL_UPDATE_DELAY = 250;

export const EMPTY_TRACKER = Object.freeze({
  version: TRACKER_VERSION,
  monthlyIncome: null,
  targetSavings: null,
  expenses: [],
});
