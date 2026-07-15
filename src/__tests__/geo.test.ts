import { haversineDistance, formatDistance } from '../utils/geo';

describe('haversineDistance', () => {
  it('is 0 for identical coordinates', () => {
    expect(haversineDistance(51.5, -0.1, 51.5, -0.1)).toBe(0);
  });

  it('is symmetric', () => {
    const a = haversineDistance(51.5, -0.1, 48.85, 2.35);
    const b = haversineDistance(48.85, 2.35, 51.5, -0.1);
    expect(Math.round(a)).toBe(Math.round(b));
  });

  it('approximates a known distance (London↔Paris ≈ 343 km)', () => {
    const metres = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(metres / 1000).toBeGreaterThan(330);
    expect(metres / 1000).toBeLessThan(355);
  });
});

describe('formatDistance', () => {
  it('formats sub-kilometre distances in metres', () => {
    expect(formatDistance(450)).toBe('450 m');
    expect(formatDistance(999)).toBe('999 m');
  });

  it('rounds metres', () => {
    expect(formatDistance(450.6)).toBe('451 m');
  });

  it('formats 1000 m as 1.0 km', () => {
    expect(formatDistance(1000)).toBe('1.0 km');
  });

  it('formats kilometres to one decimal', () => {
    expect(formatDistance(1543)).toBe('1.5 km');
  });
});
