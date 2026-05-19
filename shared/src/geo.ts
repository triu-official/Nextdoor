import type { LocalitySeed } from './models';

export const localitySeed: LocalitySeed[] = [
  { city: 'Mumbai', locality: 'Bandra West', pincode: '400050', lat: 19.0596, lng: 72.8295 },
  { city: 'Mumbai', locality: 'Andheri East', pincode: '400069', lat: 19.1136, lng: 72.8697 },
  { city: 'Delhi', locality: 'Saket', pincode: '110017', lat: 28.5245, lng: 77.2066 },
  { city: 'Delhi', locality: 'Dwarka', pincode: '110075', lat: 28.5921, lng: 77.046 },
  { city: 'Bengaluru', locality: 'Koramangala', pincode: '560034', lat: 12.9352, lng: 77.6245 },
  { city: 'Bengaluru', locality: 'Indiranagar', pincode: '560038', lat: 12.9784, lng: 77.6408 },
  { city: 'Hyderabad', locality: 'Hitech City', pincode: '500081', lat: 17.4435, lng: 78.3772 },
  { city: 'Hyderabad', locality: 'Banjara Hills', pincode: '500034', lat: 17.4126, lng: 78.4482 },
  { city: 'Chennai', locality: 'Adyar', pincode: '600020', lat: 13.0012, lng: 80.2565 },
  { city: 'Chennai', locality: 'Velachery', pincode: '600042', lat: 12.9791, lng: 80.2184 }
];

export function getLocalityCoordinates(city: string, locality: string): LocalitySeed | undefined {
  return localitySeed.find(
    (item) => item.city.toLowerCase() === city.toLowerCase() && item.locality.toLowerCase() === locality.toLowerCase()
  );
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function generateOtp(length = 6): string {
  const max = 10 ** length - 1;
  return String(Math.floor(Math.random() * max)).padStart(length, '0');
}
