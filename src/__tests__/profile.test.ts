import { computeProfileStats, memberSince, homeCity } from '../utils/profile';
import { SavedPlace } from '../types';
import { MOCK_PLACES } from './fixtures/places';

function saved(id: string, city: string, visited: boolean): SavedPlace {
  const base = MOCK_PLACES.find((p) => p.id === id) ?? MOCK_PLACES[0];
  return { ...base, id, city, visited, savedAt: '2025-01-01' };
}

describe('computeProfileStats', () => {
  it('counts visited, pending and distinct cities', () => {
    const list = [
      saved('a', 'London, UK', true),
      saved('b', 'London, UK', false),
      saved('c', 'Kyiv, UA', true),
    ];
    expect(computeProfileStats(list)).toEqual({ visited: 2, pending: 1, cities: 2 });
  });

  it('ignores empty city names when counting cities', () => {
    const list = [saved('a', '', false), saved('b', 'Kyiv, UA', false)];
    expect(computeProfileStats(list).cities).toBe(1);
  });

  it('returns zeros for an empty list', () => {
    expect(computeProfileStats([])).toEqual({ visited: 0, pending: 0, cities: 0 });
  });
});

describe('memberSince', () => {
  it('formats the year', () => {
    expect(memberSince('2024-05-16T00:00:00Z')).toBe('Since 2024');
  });

  it('returns empty for undefined or unparseable input', () => {
    expect(memberSince(undefined)).toBe('');
    expect(memberSince('not-a-date')).toBe('');
  });
});

describe('homeCity', () => {
  it('returns the most-saved city', () => {
    const list = [
      saved('a', 'London, UK', false),
      saved('b', 'Kyiv, UA', false),
      saved('c', 'London, UK', false),
    ];
    expect(homeCity(list)).toBe('London, UK');
  });

  it('returns empty string when there are no cities', () => {
    expect(homeCity([])).toBe('');
    expect(homeCity([saved('a', '', false)])).toBe('');
  });
});
