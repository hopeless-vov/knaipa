export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserPreferences {
  distanceUnit: 'km' | 'mi';
  language: string;
  notifications: {
    push: boolean;
    email: boolean;
    location: boolean;
  };
}
