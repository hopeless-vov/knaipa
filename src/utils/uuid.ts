/**
 * RFC-4122 v4 UUID. `crypto.randomUUID()` is unavailable in Hermes, so this
 * uses Math.random — fine for autocomplete session tokens (not security-grade).
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
