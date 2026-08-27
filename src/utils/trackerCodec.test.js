import { describe, expect, it } from "vitest";
import { decodeTrackerHash, encodeTrackerState } from "./trackerCodec";

const tracker = {
  version: 1,
  monthlyIncome: 3_500_000,
  targetSavings: 800_000,
  expenses: [{ id: "row-1", name: "Internet", quantity: 1, unitCost: 169_900 }],
};

describe("tracker codec", () => {
  it("round trips a tracker through a compact versioned hash", () => {
    const hash = encodeTrackerState(tracker);
    expect(hash.startsWith("v1:")).toBe(true);
    expect(decodeTrackerHash(`#${hash}`)).toEqual(tracker);
  });

  it("returns null for an empty hash", () => expect(decodeTrackerHash("")).toBeNull());
  it("rejects unsupported versions", () => expect(() => decodeTrackerHash("#v2:anything")).toThrow(/not supported/));
  it("rejects corrupted data", () => expect(() => decodeTrackerHash("#v1:not-valid-data")).toThrow(/corrupted/));
  it("rejects too many expenses", () => {
    const oversized = { ...tracker, expenses: Array.from({ length: 101 }, (_, i) => ({ id: `r${i}`, name: "x", quantity: 1, unitCost: 1 })) };
    expect(() => encodeTrackerState(oversized)).toThrow(/too many/);
  });
});
