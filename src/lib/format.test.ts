import { describe, it, expect } from 'vitest';
import { formatTanggal, formatRupiah } from './format';

describe('Format Utils', () => {
  it('formatTanggal should return formatted date dd/mm/yy', () => {
    // 2026-08-28 -> 28/08/26
    const dateStr = '2026-08-28T10:00:00Z';
    expect(formatTanggal(dateStr)).toBe('28/08/26');
  });

  it('formatRupiah should return formatted currency string', () => {
    expect(formatRupiah(150000)).toBe('Rp\xa0150.000');
    expect(formatRupiah('250000')).toBe('Rp\xa0250.000');
  });

  it('formatTanggal should handle empty or invalid inputs safely', () => {
    expect(formatTanggal(null)).toBe('—');
    expect(formatTanggal(undefined)).toBe('—');
  });
});
