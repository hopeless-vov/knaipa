import { padIndex, getSubcategory, formatHours } from '../utils/formatters';
import { OpeningHours } from '../types/googleApi';

describe('padIndex', () => {
  it('pads single-digit numbers with a leading zero', () => {
    expect(padIndex(1)).toBe('01');
    expect(padIndex(9)).toBe('09');
  });

  it('does not pad two-digit numbers', () => {
    expect(padIndex(10)).toBe('10');
    expect(padIndex(99)).toBe('99');
  });

  it('handles zero', () => {
    expect(padIndex(0)).toBe('00');
  });
});

describe('getSubcategory', () => {
  it('returns the part after " / "', () => {
    expect(getSubcategory('Museum / Art')).toBe('Art');
  });

  it('returns the part after " / " for multiple slashes', () => {
    expect(getSubcategory('A / B / C')).toBe('C');
  });

  it('returns original string if no " / " separator', () => {
    expect(getSubcategory('Culture')).toBe('Culture');
  });
});

describe('formatHours', () => {
  const MONDAY = 1; // JS getDay(): Sun=0..Sat=6
  const SUNDAY = 0;

  it('returns "Hours unavailable" when there is no data', () => {
    expect(formatHours(undefined, MONDAY)).toBe('Hours unavailable');
  });

  it('uses weekdayDescriptions with the (today+6)%7 index and strips the label', () => {
    const hours = {
      weekdayDescriptions: [
        'Monday: 9:00 AM – 5:00 PM', // index 0 → Monday
        'Tuesday: 9:00 AM – 5:00 PM',
      ],
    } as OpeningHours;
    expect(formatHours(hours, MONDAY)).toBe('9:00 AM – 5:00 PM');
  });

  it('maps "Closed" to "Closed today"', () => {
    const hours = {
      weekdayDescriptions: ['', '', '', '', '', '', 'Sunday: Closed'], // index 6 → Sunday
    } as OpeningHours;
    expect(formatHours(hours, SUNDAY)).toBe('Closed today');
  });

  it('falls through to periods when the description is missing', () => {
    const hours = {
      weekdayDescriptions: ['Monday: 9-5'], // only index 0 present
      periods: [{ open: { day: MONDAY, hour: 8, minute: 30 }, close: { day: MONDAY, hour: 20, minute: 0 } }],
    } as OpeningHours;
    // today=Monday → index 0 present → uses description
    expect(formatHours(hours, MONDAY)).toBe('9-5');
  });

  it('formats a matching period with zero-padding', () => {
    const hours = {
      periods: [{ open: { day: MONDAY, hour: 9, minute: 0 }, close: { day: MONDAY, hour: 17, minute: 30 } }],
    } as OpeningHours;
    expect(formatHours(hours, MONDAY)).toBe('09:00 – 17:30');
  });

  it('shows "(open)" when a period has no close', () => {
    const hours = {
      periods: [{ open: { day: MONDAY, hour: 0, minute: 0 } }],
    } as OpeningHours;
    expect(formatHours(hours, MONDAY)).toBe('00:00 – (open)');
  });

  it('returns "Hours unavailable" when no period matches today', () => {
    const hours = {
      periods: [{ open: { day: SUNDAY, hour: 9, minute: 0 }, close: { day: SUNDAY, hour: 17, minute: 0 } }],
    } as OpeningHours;
    expect(formatHours(hours, MONDAY)).toBe('Hours unavailable');
  });
});
