export type DiscoveryMode = 'browse' | 'search';

export interface Filters {
  /** browse = nearbySearch by category; search = free-text searchText */
  mode: DiscoveryMode;
  /** Browse mode: selected category labels (mapped to Google includedTypes) */
  categories: string[];
  /** Search mode: free-text query */
  query: string;
  locText: string;
  radius: string;
  price: string;
  rating: string;
  availability: string;
  sort: 'relevance' | 'distance' | 'rating';
  minReviews: 'any' | '50+' | '200+' | '500+';
  hideSeen: boolean;
}
