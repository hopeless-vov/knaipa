import { padIndex, getSubcategory } from '../utils/formatters';

describe('padIndex', () => {
  it('pads single-digit numbers with a leading zero', () => {
    expect(padIndex(1)).toBe('01');
    expect(padIndex(9)).toBe('09');
  });

  it('does not pad two-digit numbers', () => {
    expect(padIndex(10)).toBe('10');
    expect(padIndex(99)).toBe('99');
  });

  it('handles zero', () => {
    expect(padIndex(0)).toBe('00');
  });
});

describe('getSubcategory', () => {
  it('returns the part after " / "', () => {
    expect(getSubcategory('Museum / Art')).toBe('Art');
  });

  it('returns the part after " / " for multiple slashes', () => {
    expect(getSubcategory('A / B / C')).toBe('C');
  });

  it('returns original string if no " / " separator', () => {
    expect(getSubcategory('Culture')).toBe('Culture');
  });
});
