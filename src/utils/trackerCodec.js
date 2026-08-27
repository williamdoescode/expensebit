import LZString from "lz-string";
import { HASH_PREFIX, TRACKER_VERSION } from "../constants/tracker";
import { validateTrackerState } from "./trackerValidation";

export function encodeTrackerState(state) {
  const validState = validateTrackerState(state);
  const compactState = {
    v: TRACKER_VERSION,
    i: validState.monthlyIncome,
    s: validState.targetSavings,
    e: validState.expenses.map(({ id, name, quantity, unitCost }) => [id, name, quantity, unitCost]),
  };
  return `${HASH_PREFIX}${LZString.compressToEncodedURIComponent(JSON.stringify(compactState))}`;
}

export function decodeTrackerHash(hash) {
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!cleanHash) return null;

  const separator = cleanHash.indexOf(":");
  if (separator === -1) throw new Error("This link does not contain a recognized tracker.");
  const versionLabel = cleanHash.slice(0, separator);
  if (versionLabel !== `v${TRACKER_VERSION}`) {
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
  if (!compact || compact.v !== TRACKER_VERSION || !Array.isArray(compact.e)) {
    throw new Error("The tracker data has an invalid structure.");
  }

  return validateTrackerState({
    version: compact.v,
    monthlyIncome: compact.i,
    targetSavings: compact.s,
    expenses: compact.e.map((row) => ({
      id: row?.[0],
      name: row?.[1],
      quantity: row?.[2],
      unitCost: row?.[3],
    })),
  });
}
