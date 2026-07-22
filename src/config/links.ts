// App deep-linking. `APP_SCHEME` must match `scheme` in app.config.js.
export const APP_SCHEME = 'knaipa';

// Where Supabase sends the user after they tap a password-reset email. The
// scheme deep-links back into the app (handled via the PASSWORD_RECOVERY auth
// event) instead of dead-ending in a browser.
export const PASSWORD_RESET_REDIRECT = `${APP_SCHEME}://reset-password`;
