/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula.
 * Returns distance in kilometers (rounded to 2 decimal places).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates bounding box coordinates for a center point and radius in kilometers.
 * Used for database spatial pre-filtering before exact distance calculation.
 */
export function getBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
  const R = 6371; // Earth's radius in km
  // Angular distance in radians on a great circle
  const radDist = radiusKm / R;

  const minLat = lat - (radDist * 180) / Math.PI;
  const maxLat = lat + (radDist * 180) / Math.PI;

  const minLon = lon - ((radDist * 180) / Math.PI) / Math.cos((lat * Math.PI) / 180);
  const maxLon = lon + ((radDist * 180) / Math.PI) / Math.cos((lat * Math.PI) / 180);

  return { minLat, maxLat, minLon, maxLon };
}
