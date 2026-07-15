// Raw Google Places API response shapes.
// These are internal to the api/ layer but live here to keep all types in one place.

export interface OpeningHoursPeriodTime {
  day: number;
  hour?: number;
  minute?: number;
}

export interface OpeningHoursPeriod {
  open?: OpeningHoursPeriodTime;
  close?: OpeningHoursPeriodTime;
}

export interface OpeningHours {
  periods?: OpeningHoursPeriod[];
  openNow?: boolean;
  weekdayDescriptions?: string[];
}

export interface AddressComponent {
  longText?: string;
  types?: string[];
}

export interface GooglePlacePhoto {
  name: string;
}

export interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  photos?: GooglePlacePhoto[];
  primaryType?: string;
  types?: string[];
  priceLevel?: string;
  editorialSummary?: { text?: string };
  regularOpeningHours?: OpeningHours;
  currentOpeningHours?: OpeningHours;
  addressComponents?: AddressComponent[];
}

export interface AutocompleteSuggestion {
  placeId: string;
  text: string;
  mainText: string;
  secondaryText: string;
}
