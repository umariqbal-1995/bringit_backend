/**
 * Haversine formula — calculate distance between two lat/lon points.
 * Returns distance in **kilometres**.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert km to metres */
export const kmToMetres = (km: number): number => km * 1000;

/** Convert metres to km */
export const metresToKm = (m: number): number => m / 1000;

/** Minimum metres a rider must move before we emit a socket event */
export const RIDER_LOCATION_UPDATE_THRESHOLD_M = 200;
