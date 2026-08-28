import { describe, expect, it } from "vitest";
import { formatMonth, getNextMonth, getPreviousMonth, isValidMonth } from "./month";

describe("month utilities", () => {
  it("advances months across a year boundary", () => {
    expect(getNextMonth("2026-12")).toBe("2027-01");
  });

  it("finds the prior month across a year boundary", () => {
    expect(getPreviousMonth("2026-01")).toBe("2025-12");
  });

  it("formats a month for display", () => {
    expect(formatMonth("2026-08")).toBe("August 2026");
  });

  it("rejects malformed month values", () => {
    expect(isValidMonth("2026-13")).toBe(false);
    expect(getNextMonth("not-a-month")).toBe("");
  });
});
