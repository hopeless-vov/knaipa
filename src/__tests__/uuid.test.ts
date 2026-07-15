import { generateUUID } from '../utils/uuid';

const V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUUID', () => {
  it('returns a valid v4 UUID', () => {
    expect(generateUUID()).toMatch(V4);
  });

  it('returns distinct values', () => {
    const set = new Set(Array.from({ length: 50 }, () => generateUUID()));
    expect(set.size).toBe(50);
  });
});
