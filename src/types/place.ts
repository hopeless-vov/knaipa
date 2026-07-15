export interface Place {
  id: string;
  name: string;
  category: string;
  cover: string;
  gallery: string[];
  distance: string;
  hours: string;
  price: string;
  rating: string;
  userRatingCount: number;
  type: string;
  highlights: string[];
  address: string;
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface PlaceExtraDetails {
  websiteUri?: string;
  nationalPhoneNumber?: string;
}

export interface SavedPlace extends Place {
  visited: boolean;
  savedAt: string;
}

export interface SwipeHistoryEntry {
  place: Place;
  action: 'like' | 'pass';
}
