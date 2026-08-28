import { describe, expect, it } from "vitest";
import LZString from "lz-string";
import { decodeTrackerHash, encodeTrackerState } from "./trackerCodec";

const tracker = {
  version: 5,
  currentMonth: "2026-08",
  monthLocked: true,
  monthlyIncome: 3_500_000,
  targetSavings: 800_000,
  previousMonthBalance: 250_000,
  accumulatedOverallBalance: 900_000,
  accumulatedSavings: 1_600_000,
  expenses: [{ id: "row-1", name: "Internet", quantity: 1, unitCost: 169_900, checked: true }],
};

function createLegacyHash(state) {
  const compact = {
    v: 1,
    i: state.monthlyIncome,
    s: state.targetSavings,
    e: state.expenses.map(({ id, name, quantity, unitCost }) => [id, name, quantity, unitCost]),
  };
  return `v1:${LZString.compressToEncodedURIComponent(JSON.stringify(compact))}`;
}

function createV2Hash(state) {
  const compact = [
    state.monthlyIncome,
    state.targetSavings,
    state.expenses.map(({ name, quantity, unitCost, checked }) => (
      checked ? [name, quantity, unitCost, 1] : [name, quantity, unitCost]
    )),
  ];
  return `v2:${LZString.compressToEncodedURIComponent(JSON.stringify(compact))}`;
}

function createV3Hash(state) {
  const compact = [
    state.currentMonth,
    state.monthlyIncome,
    state.targetSavings,
    state.previousMonthBalance,
    state.accumulatedSavings,
    state.expenses.map(({ name, quantity, unitCost, checked }) => (
      checked ? [name, quantity, unitCost, 1] : [name, quantity, unitCost]
    )),
  ];
  return `v3:${LZString.compressToEncodedURIComponent(JSON.stringify(compact))}`;
}

function createV4Hash(state) {
  const compact = [
    state.currentMonth,
    state.monthlyIncome,
    state.targetSavings,
    state.previousMonthBalance,
    state.accumulatedOverallBalance,
    state.accumulatedSavings,
    state.expenses.map(({ name, quantity, unitCost, checked }) => (
      checked ? [name, quantity, unitCost, 1] : [name, quantity, unitCost]
    )),
  ];
  return `v4:${LZString.compressToEncodedURIComponent(JSON.stringify(compact))}`;
}

describe("tracker codec", () => {
  it("round trips a tracker through a compact versioned hash", () => {
    const hash = encodeTrackerState(tracker);
    expect(hash.startsWith("xsd:")).toBe(true);
    expect(decodeTrackerHash(`#${hash}`)).toEqual({
      ...tracker,
      expenses: [{ ...tracker.expenses[0], id: "r0" }],
    });
  });

  it("continues to open existing v5 links", () => {
    const legacyV5Hash = encodeTrackerState(tracker).replace(/^xsd:/, "v5:");
    expect(decodeTrackerHash(legacyV5Hash)).toMatchObject({
      version: 5,
      currentMonth: "2026-08",
      monthLocked: true,
    });
  });

  it("opens v1 links and migrates unchecked expenses to v5", () => {
    const decoded = decodeTrackerHash(createLegacyHash(tracker));
    expect(decoded.version).toBe(5);
    expect(decoded.currentMonth).toBe("");
    expect(decoded.monthLocked).toBe(false);
    expect(decoded.expenses[0]).toMatchObject({ id: "row-1", checked: false, name: "Internet" });
  });

  it("opens v2 links with safe defaults for monthly rollovers", () => {
    const decoded = decodeTrackerHash(createV2Hash(tracker));
    expect(decoded).toMatchObject({
      version: 5,
      currentMonth: "",
      monthLocked: false,
      previousMonthBalance: 0,
      accumulatedSavings: 0,
    });
    expect(decoded.expenses[0]).toMatchObject({ checked: true, name: "Internet" });
  });

  it("opens v3 links with a zero overall balance", () => {
    const decoded = decodeTrackerHash(createV3Hash(tracker));
    expect(decoded).toMatchObject({
      version: 5,
      currentMonth: "2026-08",
      monthLocked: false,
      accumulatedOverallBalance: 0,
      accumulatedSavings: 1_600_000,
    });
  });

  it("opens v4 links with an editable month", () => {
    const decoded = decodeTrackerHash(createV4Hash(tracker));
    expect(decoded).toMatchObject({
      version: 5,
      currentMonth: "2026-08",
      monthLocked: false,
      accumulatedOverallBalance: 900_000,
    });
  });

  it("is substantially shorter than the equivalent v1 hash", () => {
    const multiRowTracker = {
      ...tracker,
      expenses: Array.from({ length: 10 }, (_, index) => ({
        id: `930b3608-1797-4ac0-9c0b-${String(index).padStart(12, "0")}`,
        name: `Expense ${index + 1}`,
        quantity: 1,
        unitCost: 10_000 + index,
        checked: index % 2 === 0,
      })),
    };
    expect(encodeTrackerState(multiRowTracker).length).toBeLessThan(createLegacyHash(multiRowTracker).length * 0.65);
  });

  it("returns null for an empty hash", () => expect(decodeTrackerHash("")).toBeNull());
  it("rejects unsupported versions", () => expect(() => decodeTrackerHash("#v6:anything")).toThrow(/not supported/));
  it("rejects corrupted data", () => expect(() => decodeTrackerHash("#xsd:not-valid-data")).toThrow(/corrupted/));
  it("rejects too many expenses", () => {
    const oversized = { ...tracker, expenses: Array.from({ length: 21 }, (_, i) => ({ id: `r${i}`, name: "x", quantity: 1, unitCost: 1, checked: false })) };
    expect(() => encodeTrackerState(oversized)).toThrow(/too many/);
  });
});
