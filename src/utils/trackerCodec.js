import LZString from "lz-string";
import { HASH_PREFIX, TRACKER_VERSION } from "../constants/tracker";
import { validateTrackerState } from "./trackerValidation";

export function encodeTrackerState(state) {
  const validState = validateTrackerState(state);
  // Row IDs only support the live React UI, so omitting them makes shared links substantially smaller.
  const compactState = [
    validState.currentMonth,
    validState.monthLocked ? 1 : 0,
    validState.monthlyIncome,
    validState.targetSavings,
    validState.previousMonthBalance,
    validState.accumulatedOverallBalance,
    validState.accumulatedSavings,
    validState.expenses.map(({ name, quantity, unitCost, checked }) => (
      checked ? [name, quantity, unitCost, 1] : [name, quantity, unitCost]
    )),
  ];
  return `${HASH_PREFIX}${LZString.compressToEncodedURIComponent(JSON.stringify(compactState))}`;
}

function decodeV1(compact) {
  if (!compact || compact.v !== 1 || !Array.isArray(compact.e)) {
    throw new Error("The tracker data has an invalid structure.");
  }
  return {
    version: 1,
    currentMonth: "",
    monthLocked: false,
    monthlyIncome: compact.i,
    targetSavings: compact.s,
    previousMonthBalance: 0,
    accumulatedOverallBalance: 0,
    accumulatedSavings: 0,
    expenses: compact.e.map((row) => ({
      id: row?.[0],
      name: row?.[1],
      quantity: row?.[2],
      unitCost: row?.[3],
      checked: false,
    })),
  };
}

function decodeV2(compact) {
  if (!Array.isArray(compact) || compact.length !== 3 || !Array.isArray(compact[2])) {
    throw new Error("The tracker data has an invalid structure.");
  }
  return {
    version: TRACKER_VERSION,
    currentMonth: "",
    monthLocked: false,
    monthlyIncome: compact[0],
    targetSavings: compact[1],
    previousMonthBalance: 0,
    accumulatedOverallBalance: 0,
    accumulatedSavings: 0,
    expenses: compact[2].map((row, index) => {
      if (!Array.isArray(row) || row.length < 3 || row.length > 4 || (row[3] !== undefined && row[3] !== 1)) {
        throw new Error("The tracker data has an invalid expense row.");
      }
      return {
        id: `r${index}`,
        name: row[0],
        quantity: row[1],
        unitCost: row[2],
        checked: row[3] === 1,
      };
    }),
  };
}

function decodeV3(compact) {
  if (!Array.isArray(compact) || compact.length !== 6 || !Array.isArray(compact[5])) {
    throw new Error("The tracker data has an invalid structure.");
  }
  return {
    version: TRACKER_VERSION,
    currentMonth: compact[0],
    monthLocked: false,
    monthlyIncome: compact[1],
    targetSavings: compact[2],
    previousMonthBalance: compact[3],
    accumulatedOverallBalance: 0,
    accumulatedSavings: compact[4],
    expenses: compact[5].map((row, index) => {
      if (!Array.isArray(row) || row.length < 3 || row.length > 4 || (row[3] !== undefined && row[3] !== 1)) {
        throw new Error("The tracker data has an invalid expense row.");
      }
      return {
        id: `r${index}`,
        name: row[0],
        quantity: row[1],
        unitCost: row[2],
        checked: row[3] === 1,
      };
    }),
  };
}

function decodeV4(compact) {
  if (!Array.isArray(compact) || compact.length !== 7 || !Array.isArray(compact[6])) {
    throw new Error("The tracker data has an invalid structure.");
  }
  return {
    version: TRACKER_VERSION,
    currentMonth: compact[0],
    monthLocked: false,
    monthlyIncome: compact[1],
    targetSavings: compact[2],
    previousMonthBalance: compact[3],
    accumulatedOverallBalance: compact[4],
    accumulatedSavings: compact[5],
    expenses: compact[6].map((row, index) => {
      if (!Array.isArray(row) || row.length < 3 || row.length > 4 || (row[3] !== undefined && row[3] !== 1)) {
        throw new Error("The tracker data has an invalid expense row.");
      }
      return {
        id: `r${index}`,
        name: row[0],
        quantity: row[1],
        unitCost: row[2],
        checked: row[3] === 1,
      };
    }),
  };
}

function decodeV5(compact) {
  if (!Array.isArray(compact) || compact.length !== 8 || !Array.isArray(compact[7])) {
    throw new Error("The tracker data has an invalid structure.");
  }
  if (compact[1] !== 0 && compact[1] !== 1) {
    throw new Error("The tracker month lock is invalid.");
  }
  return {
    version: TRACKER_VERSION,
    currentMonth: compact[0],
    monthLocked: compact[1] === 1,
    monthlyIncome: compact[2],
    targetSavings: compact[3],
    previousMonthBalance: compact[4],
    accumulatedOverallBalance: compact[5],
    accumulatedSavings: compact[6],
    expenses: compact[7].map((row, index) => {
      if (!Array.isArray(row) || row.length < 3 || row.length > 4 || (row[3] !== undefined && row[3] !== 1)) {
        throw new Error("The tracker data has an invalid expense row.");
      }
      return {
        id: `r${index}`,
        name: row[0],
        quantity: row[1],
        unitCost: row[2],
        checked: row[3] === 1,
      };
    }),
  };
}

export function decodeTrackerHash(hash) {
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!cleanHash) return null;

  const separator = cleanHash.indexOf(":");
  if (separator === -1) throw new Error("This link does not contain a recognized tracker.");
  const versionLabel = cleanHash.slice(0, separator);
  if (!["v1", "v2", "v3", "v4", `v${TRACKER_VERSION}`, "xsd"].includes(versionLabel)) {
    throw new Error(`Tracker version “${versionLabel}” is not supported.`);
  }

  const json = LZString.decompressFromEncodedURIComponent(cleanHash.slice(separator + 1));
  if (!json) throw new Error("The tracker link is incomplete or corrupted.");

  let compact;
  try {
    compact = JSON.parse(json);
  } catch {
    throw new Error("The tracker link contains unreadable data.");
  }
  const decoders = { v1: decodeV1, v2: decodeV2, v3: decodeV3, v4: decodeV4, v5: decodeV5, xsd: decodeV5 };
  return validateTrackerState(decoders[versionLabel](compact));
}
