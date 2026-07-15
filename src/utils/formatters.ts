import { OpeningHours } from '../types/googleApi';

export function padIndex(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function getSubcategory(category: string): string {
  const parts = category.split(' / ');
  return parts.length > 1 ? parts[parts.length - 1] : category;
}

/**
 * Returns a human-readable opening hours string for today.
 *
 * Prefers Google's pre-formatted weekdayDescriptions.
 * weekdayDescriptions index: (getDay() + 6) % 7  (API: Mon=0, JS Sun=0)
 * Falls back to manual period parsing if weekdayDescriptions is absent.
 */
export function formatHours(hours: OpeningHours | undefined, today: number): string {
  if (hours?.weekdayDescriptions) {
    const index = (today + 6) % 7;
    const description = hours.weekdayDescriptions[index];
    if (description) {
      const timeRange = description.replace(/^[^:]+:\s*/, '');
      return timeRange === 'Closed' ? 'Closed today' : timeRange;
    }
  }

  const period = hours?.periods?.find((p) => p.open?.day === today);
  if (!period?.open) return 'Hours unavailable';
  const fmt = (h = 0, m = 0) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const openTime = fmt(period.open.hour, period.open.minute);
  if (!period.close) return `${openTime} – (open)`;
  return `${openTime} – ${fmt(period.close.hour, period.close.minute)}`;
}
