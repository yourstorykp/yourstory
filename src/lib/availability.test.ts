import { describe, it, expect } from "vitest";
import { hasConflict, BookedRange } from "./availability";

describe("hasConflict logic", () => {
  it("should return false if qty is exactly total stock and no bookings", () => {
    const ranges: BookedRange[] = [];
    expect(hasConflict(5, ranges, "2024-05-01", "2024-05-05", 5)).toBe(false);
  });

  it("should return true if qty > total stock even without bookings", () => {
    const ranges: BookedRange[] = [];
    expect(hasConflict(5, ranges, "2024-05-01", "2024-05-05", 6)).toBe(true);
  });

  it("should return true if dates overlap and stock becomes insufficient", () => {
    // 2 units total, 1 is booked from 05-01 to 05-05
    const ranges: BookedRange[] = [
      { start: "2024-05-01", end: "2024-05-05", qty: 1 }
    ];
    // Trying to book 2 units from 05-03 to 05-07
    // On 05-03 to 05-05, total booked will be 1 (existing) + 2 (new) = 3 > 2 (stokTotal)
    expect(hasConflict(2, ranges, "2024-05-03", "2024-05-07", 2)).toBe(true);
  });

  it("should return false if dates overlap but stock is still sufficient", () => {
    // 5 units total, 1 is booked from 05-01 to 05-05, 2 are booked from 05-04 to 05-08
    const ranges: BookedRange[] = [
      { start: "2024-05-01", end: "2024-05-05", qty: 1 },
      { start: "2024-05-04", end: "2024-05-08", qty: 2 }
    ];
    // On 05-04 and 05-05, existing booked = 3. 
    // Trying to book 2 more. 3 + 2 = 5 <= 5. So it should be false (no conflict).
    expect(hasConflict(5, ranges, "2024-05-03", "2024-05-07", 2)).toBe(false);
  });

  it("should return false if dates do not overlap at all", () => {
    // 1 unit total. Booked 05-01 to 05-05.
    const ranges: BookedRange[] = [
      { start: "2024-05-01", end: "2024-05-05", qty: 1 }
    ];
    // Trying to book on 05-06 to 05-10
    expect(hasConflict(1, ranges, "2024-05-06", "2024-05-10", 1)).toBe(false);
  });
});
