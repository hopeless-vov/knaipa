/**
 * Returns the distance in metres between two coordinates (Haversine formula).
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const METRES_PER_MILE = 1609.344;

/**
 * Formats a distance in metres to a human-readable string in the given unit.
 * km: < 1 000 m → "450 m", >= 1 000 m → "1.5 km"
 * mi: < 0.1 mi → feet ("320 ft"), else "1.2 mi"
 */
export function formatDistance(metres: number, unit: 'km' | 'mi' = 'km'): string {
  if (unit === 'mi') {
    const miles = metres / METRES_PER_MILE;
    return miles < 0.1 ? `${Math.round(metres * 3.28084)} ft` : `${miles.toFixed(1)} mi`;
  }
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`;
}
