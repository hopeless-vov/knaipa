import { serverFilterKey } from '../utils/filterKey';
import { DEFAULT_FILTERS } from '../store/useAppStore';

describe('serverFilterKey', () => {
  it('is stable for the same server-affecting filters', () => {
    expect(serverFilterKey({ ...DEFAULT_FILTERS })).toBe(serverFilterKey({ ...DEFAULT_FILTERS }));
  });

  it('ignores client-only refinements (sort, minReviews, hideSeen) and locText', () => {
    const base = serverFilterKey({ ...DEFAULT_FILTERS });
    expect(serverFilterKey({ ...DEFAULT_FILTERS, sort: 'rating' })).toBe(base);
    expect(serverFilterKey({ ...DEFAULT_FILTERS, minReviews: '200+' })).toBe(base);
    expect(serverFilterKey({ ...DEFAULT_FILTERS, hideSeen: true })).toBe(base);
    expect(serverFilterKey({ ...DEFAULT_FILTERS, locText: 'Kyiv' })).toBe(base);
  });

  it('changes when a server-affecting filter changes', () => {
    const base = serverFilterKey({ ...DEFAULT_FILTERS });
    expect(serverFilterKey({ ...DEFAULT_FILTERS, price: '££' })).not.toBe(base);
    expect(serverFilterKey({ ...DEFAULT_FILTERS, categories: ['Food'] })).not.toBe(base);
    expect(serverFilterKey({ ...DEFAULT_FILTERS, query: 'ramen' })).not.toBe(base);
  });
});
