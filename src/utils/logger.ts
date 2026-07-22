/**
 * Tiny centralized logger. Wraps console so that (a) swallowed failures become
 * visible in dev instead of vanishing, and (b) there is a single seam to route
 * logs to a crash/analytics service (Sentry, etc.) later without touching call
 * sites. Kept dependency-free on purpose.
 */

/* istanbul ignore next -- thin console wrappers, no branching logic to cover */
export function logWarn(message: string, error?: unknown): void {
  if (error !== undefined) console.warn(`[knaipa] ${message}`, error);
  else console.warn(`[knaipa] ${message}`);
}

/* istanbul ignore next -- thin console wrapper */
export function logError(message: string, error?: unknown): void {
  if (error !== undefined) console.error(`[knaipa] ${message}`, error);
  else console.error(`[knaipa] ${message}`);
}
