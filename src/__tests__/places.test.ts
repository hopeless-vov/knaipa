import { isOpenEvening } from '../utils/places';
import { OpeningHours } from '../types/googleApi';

const MONDAY = 1;

beforeEach(() => {
  jest.spyOn(Date.prototype, 'getDay').mockReturnValue(MONDAY);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('isOpenEvening', () => {
  it('returns false when hours are undefined', () => {
    expect(isOpenEvening(undefined)).toBe(false);
  });

  it('returns false when no period matches today', () => {
    const hours = {
      periods: [{ open: { day: 0, hour: 10 }, close: { day: 0, hour: 22 } }],
    } as OpeningHours;
    expect(isOpenEvening(hours)).toBe(false);
  });

  it("returns false when today's period has no close", () => {
    const hours = { periods: [{ open: { day: MONDAY, hour: 10 } }] } as OpeningHours;
    expect(isOpenEvening(hours)).toBe(false);
  });

  it('returns true when closing at or after 20:00', () => {
    const hours = {
      periods: [{ open: { day: MONDAY, hour: 10 }, close: { day: MONDAY, hour: 20, minute: 0 } }],
    } as OpeningHours;
    expect(isOpenEvening(hours)).toBe(true);
  });

  it('returns false when closing before 20:00', () => {
    const hours = {
      periods: [{ open: { day: MONDAY, hour: 10 }, close: { day: MONDAY, hour: 19, minute: 59 } }],
    } as OpeningHours;
    expect(isOpenEvening(hours)).toBe(false);
  });
});
