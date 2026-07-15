import { buildRequestBody, mapGooglePlace } from '../mappers/googlePlaces';
import { GooglePlace } from '../types/googleApi';
import { DEFAULT_FILTERS } from '../store/useAppStore';
import { Filters } from '../types';
import { FALLBACK_IMAGE } from '../utils/places';

const MONDAY = 1;
function filters(o: Partial<Filters>): Filters {
  return { ...DEFAULT_FILTERS, ...o };
}

beforeEach(() => jest.spyOn(Date.prototype, 'getDay').mockReturnValue(MONDAY));
afterEach(() => jest.restoreAllMocks());

describe('buildRequestBody', () => {
  it('builds a relevance query with location bias for defaults', () => {
    const body = buildRequestBody(51.5, -0.1, filters({})) as Record<string, any>;
    expect(body.textQuery).toBe('things to do');
    expect(body.rankPreference).toBe('RELEVANCE');
    expect(body.locationBias.circle.radius).toBe(1500);
    expect(body.locationBias.circle.center).toEqual({ latitude: 51.5, longitude: -0.1 });
    expect(body.openNow).toBeUndefined();
    expect(body.minRating).toBeUndefined();
    expect(body.priceLevels).toBeUndefined();
  });

  it('uses DISTANCE ranking when sorting by distance', () => {
    const body = buildRequestBody(0, 0, filters({ sort: 'distance' })) as Record<string, any>;
    expect(body.rankPreference).toBe('DISTANCE');
  });

  it('maps category, radius, openNow, minRating and priceLevels', () => {
    const body = buildRequestBody(
      0,
      0,
      filters({ category: 'Café', radius: '5km', availability: 'Open now', rating: '4.5', price: '££' })
    ) as Record<string, any>;
    expect(body.textQuery).toBe('cafes and coffee shops');
    expect(body.locationBias.circle.radius).toBe(5000);
    expect(body.openNow).toBe(true);
    expect(body.minRating).toBe(4.5);
    expect(body.priceLevels).toEqual(['PRICE_LEVEL_MODERATE']);
  });

  it('appends a pageToken when provided', () => {
    const body = buildRequestBody(0, 0, filters({}), 'TKN') as Record<string, any>;
    expect(body.pageToken).toBe('TKN');
  });

  it('omits minRating when rating is "any"', () => {
    const body = buildRequestBody(0, 0, filters({ rating: 'any' })) as Record<string, any>;
    expect(body.minRating).toBeUndefined();
  });
});

const FULL: GooglePlace = {
  id: 'g1',
  displayName: { text: 'Blue Bottle' },
  formattedAddress: '1 Main St, Kyiv',
  location: { latitude: 50.45, longitude: 30.52 },
  rating: 4.6,
  userRatingCount: 321,
  priceLevel: 'PRICE_LEVEL_MODERATE',
  primaryType: 'coffee_shop',
  types: ['coffee_shop', 'cafe', 'food', 'store', 'point_of_interest'],
  photos: Array.from({ length: 10 }, (_, i) => ({ name: `places/g1/photos/p${i}` })),
  currentOpeningHours: { weekdayDescriptions: ['Monday: 08:00 – 22:00'] },
  addressComponents: [
    { longText: 'Kyiv', types: ['locality'] },
    { longText: 'Ukraine', types: ['country'] },
    { longText: 'Podil', types: ['sublocality'] },
  ],
} as unknown as GooglePlace;

describe('mapGooglePlace', () => {
  it('maps core fields', () => {
    const p = mapGooglePlace(FULL, 50.45, 30.52, 'KEY');
    expect(p.id).toBe('g1');
    expect(p.name).toBe('Blue Bottle');
    expect(p.category).toBe('Café / Coffee');
    expect(p.rating).toBe('4.6');
    expect(p.userRatingCount).toBe(321);
    expect(p.price).toBe('££');
    expect(p.hours).toBe('08:00 – 22:00');
    expect(p.city).toBe('Kyiv, Ukraine');
    expect(p.neighborhood).toBe('Podil');
    expect(p.highlights).toHaveLength(4); // types sliced to 4
  });

  it('builds a 600px cover and up to 7 gallery photos at 800px', () => {
    const p = mapGooglePlace(FULL, 50.45, 30.52, 'KEY');
    expect(p.cover).toContain('/places/g1/photos/p0/media?maxWidthPx=600&key=KEY');
    expect(p.gallery).toHaveLength(7); // photos 1..7 (GALLERY_MAX)
    expect(p.gallery[0]).toContain('maxWidthPx=800&key=KEY');
  });

  it('falls back for missing name, rating, price and photos', () => {
    const bare = { id: 'g2', types: [] } as unknown as GooglePlace;
    const p = mapGooglePlace(bare, 0, 0, 'KEY');
    expect(p.name).toBe('Unknown');
    expect(p.rating).toBe('N/A');
    expect(p.userRatingCount).toBe(0);
    expect(p.price).toBe('—');
    expect(p.cover).toBe(FALLBACK_IMAGE);
    expect(p.gallery).toEqual([FALLBACK_IMAGE]);
    expect(p.lat).toBe(0);
    expect(p.lng).toBe(0);
  });

  it('derives category label from primaryType when unmapped', () => {
    const p = mapGooglePlace(
      { id: 'g3', primaryType: 'ice_cream_shop', types: [] } as unknown as GooglePlace,
      0,
      0,
      'KEY'
    );
    expect(p.category).toBe('ice cream shop');
  });
});
