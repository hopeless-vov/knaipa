export interface Filters {
  locText: string;
  radius: string;
  category: string;
  price: string;
  rating: string;
  availability: string;
  sort: 'relevance' | 'distance' | 'rating';
  minReviews: 'any' | '50+' | '200+' | '500+';
  hideSeen: boolean;
}
