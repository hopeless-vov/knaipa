import { buildMapsUrl, buildWebMapsUrl, resolveWebsiteUrl, buildSharePayload } from '../utils/placeLinks';
import { MOCK_PLACES } from './fixtures/places';

const place = MOCK_PLACES[0]; // Test Museum, 1 Test St

describe('buildWebMapsUrl', () => {
  it('encodes name + address into a maps search URL', () => {
    expect(buildWebMapsUrl(place)).toBe(
      'https://www.google.com/maps/search/?api=1&query=Test%20Museum%2C%201%20Test%20St'
    );
  });
});

describe('buildMapsUrl', () => {
  it('uses the iOS deep link (Platform mock → ios)', () => {
    expect(buildMapsUrl(place)).toBe('maps://?q=Test%20Museum%2C%201%20Test%20St');
  });
});

describe('resolveWebsiteUrl', () => {
  it('prefers the place website when present', () => {
    expect(resolveWebsiteUrl(place, { websiteUri: 'https://museum.example' })).toBe(
      'https://museum.example'
    );
  });

  it('falls back to a Google search for the name', () => {
    expect(resolveWebsiteUrl(place, null)).toBe(
      'https://www.google.com/search?q=Test%20Museum'
    );
  });
});

describe('buildSharePayload', () => {
  it('bundles title, message and url', () => {
    const payload = buildSharePayload(place);
    expect(payload.title).toBe('Test Museum');
    expect(payload.message).toContain('Test Museum');
    expect(payload.message).toContain('1 Test St');
    expect(payload.url).toBe(buildWebMapsUrl(place));
  });
});
