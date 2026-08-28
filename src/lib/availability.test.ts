import { describe, it, expect } from 'vitest';
import { hasConflict, BookedRange } from './availability';

describe('Availability Logic (hasConflict)', () => {
  it('should allow booking when there are no existing bookings', () => {
    const stokTotal = 5;
    const ranges: BookedRange[] = [];
    const isConflict = hasConflict(stokTotal, ranges, '2026-09-01', '2026-09-05', 2);
    expect(isConflict).toBe(false);
  });

  it('should allow booking when total booked + new booking <= stokTotal', () => {
    const stokTotal = 5;
    const ranges: BookedRange[] = [
      { start: '2026-09-01', end: '2026-09-05', qty: 3 }
    ];
    // Wants to book 2 units. 3 + 2 = 5 (allowed)
    const isConflict = hasConflict(stokTotal, ranges, '2026-09-02', '2026-09-06', 2);
    expect(isConflict).toBe(false);
  });

  it('should block booking when total booked + new booking > stokTotal on overlapping days', () => {
    const stokTotal = 5;
    const ranges: BookedRange[] = [
      { start: '2026-09-01', end: '2026-09-05', qty: 3 }
    ];
    // Wants to book 3 units. 3 + 3 = 6 (conflict)
    const isConflict = hasConflict(stokTotal, ranges, '2026-09-02', '2026-09-06', 3);
    expect(isConflict).toBe(true);
  });

  it('should allow booking when dates do not overlap at all', () => {
    const stokTotal = 5;
    const ranges: BookedRange[] = [
      { start: '2026-09-01', end: '2026-09-05', qty: 5 } // Fully booked
    ];
    // Wants to book on 6th, no overlap.
    const isConflict = hasConflict(stokTotal, ranges, '2026-09-06', '2026-09-10', 5);
    expect(isConflict).toBe(false);
  });

  it('should calculate conflict correctly with multiple overlapping existing bookings', () => {
    const stokTotal = 10;
    const ranges: BookedRange[] = [
      { start: '2026-09-01', end: '2026-09-05', qty: 4 },
      { start: '2026-09-03', end: '2026-09-07', qty: 4 }
    ];
    // Peak booked is 8 units from 03 to 05.
    
    // Booking 2 units from 04 to 06:
    // Peak becomes 8 + 2 = 10 <= 10. Allowed.
    expect(hasConflict(stokTotal, ranges, '2026-09-04', '2026-09-06', 2)).toBe(false);

    // Booking 3 units from 04 to 06:
    // Peak becomes 8 + 3 = 11 > 10. Conflict!
    expect(hasConflict(stokTotal, ranges, '2026-09-04', '2026-09-06', 3)).toBe(true);
  });
});
