import { applyPostFetchFilters } from '../utils/placeFilters';
import { DEFAULT_FILTERS } from '../store/useAppStore';
import { Filters } from '../types';
import { GooglePlace } from '../types/googleApi';
import { MOCK_PLACES } from './fixtures/places';

const MONDAY = 1;

function filters(overrides: Partial<Filters>): Filters {
  return { ...DEFAULT_FILTERS, ...overrides };
}

// Raw places matching MOCK_PLACES ids; place-1 & place-3 stay open into the evening
const RAW: GooglePlace[] = MOCK_PLACES.map((p) => ({
  id: p.id,
  currentOpeningHours: {
    periods: [
      {
        open: { day: MONDAY, hour: 9, minute: 0 },
        close: { day: MONDAY, hour: p.id === 'place-1' || p.id === 'place-3' ? 22 : 17, minute: 0 },
      },
    ],
  },
})) as unknown as GooglePlace[];

beforeEach(() => {
  jest.spyOn(Date.prototype, 'getDay').mockReturnValue(MONDAY);
});
afterEach(() => jest.restoreAllMocks());

describe('applyPostFetchFilters', () => {
  it('returns all places when no client-side filters are set', () => {
    const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({}));
    expect(result).toHaveLength(MOCK_PLACES.length);
  });

  it('filters by minimum review count', () => {
    const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({ minReviews: '200+' }));
    expect(result.map((p) => p.id).sort()).toEqual(['place-3', 'place-5']);
  });

  it('keeps only places open in the evening', () => {
    const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({ availability: 'Open evening' }));
    expect(result.map((p) => p.id).sort()).toEqual(['place-1', 'place-3']);
  });

  it('sorts by rating descending without mutating the input', () => {
    const input = [...MOCK_PLACES];
    const result = applyPostFetchFilters(input, RAW, filters({ sort: 'rating' }));
    expect(result.map((p) => p.rating)).toEqual(['4.8', '4.7', '4.5', '4.3', '4.1']);
    // original order preserved
    expect(input.map((p) => p.id)).toEqual(MOCK_PLACES.map((p) => p.id));
  });

  it('combines minReviews and rating sort', () => {
    const result = applyPostFetchFilters(
      MOCK_PLACES,
      RAW,
      filters({ minReviews: '200+', sort: 'rating' })
    );
    // >=200 reviews: place-3(200, ★4.7), place-5(300, ★4.8); sorted by rating desc
    expect(result.map((p) => p.id)).toEqual(['place-5', 'place-3']);
  });

  // BROWSE mode: rating/price/openNow are enforced client-side (searchNearby can't)
  describe('browse-mode client-side filters', () => {
    it('filters by minimum rating', () => {
      const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({ mode: 'browse', rating: '4.5+' }));
      expect(result.map((p) => p.id).sort()).toEqual(['place-1', 'place-3', 'place-5']);
    });

    it('filters by exact price label', () => {
      const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({ mode: 'browse', price: '££' }));
      expect(result.map((p) => p.id).sort()).toEqual(['place-2', 'place-4']);
    });

    it('filters by Open now using raw openNow flags', () => {
      const raw = MOCK_PLACES.map((p) => ({
        id: p.id,
        currentOpeningHours: { openNow: p.id === 'place-2' || p.id === 'place-5' },
      })) as unknown as GooglePlace[];
      const result = applyPostFetchFilters(MOCK_PLACES, raw, filters({ mode: 'browse', availability: 'Open now' }));
      expect(result.map((p) => p.id).sort()).toEqual(['place-2', 'place-5']);
    });

    it('does NOT apply rating client-side in search mode (server handles it)', () => {
      const result = applyPostFetchFilters(MOCK_PLACES, RAW, filters({ mode: 'search', rating: '4.5+' }));
      expect(result).toHaveLength(MOCK_PLACES.length);
    });
  });
});
