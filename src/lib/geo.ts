import { supabase } from './supabase';

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  distance_m: number;
}

export async function fetchNearbyPlaces(
  lat: number,
  lng: number,
  kind: 'hospital' | 'pharmacy',
  radius_m = 5000,
): Promise<NearbyPlace[]> {
  const tag = kind === 'hospital' ? 'amenity=hospital' : 'amenity=pharmacy';
  const parts = tag.split('=');
  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["${parts[0]}"="${parts[1]}"](around:${radius_m},${lat},${lng});
      way["${parts[0]}"="${parts[1]}"](around:${radius_m},${lat},${lng});
    );
    out center 30;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(overpassQuery),
  });

  if (!res.ok) throw new Error(`Places lookup failed (${res.status})`);
  const json = await res.json();

  return (json.elements || [])
    .map((el: any): NearbyPlace => {
      const eLat = el.lat ?? el.center?.lat ?? 0;
      const eLng = el.lon ?? el.center?.lon ?? 0;
      return {
        id: String(el.id),
        name: el.tags?.name || (kind === 'hospital' ? 'Hospital' : 'Pharmacy'),
        lat: eLat,
        lng: eLng,
        category: el.tags?.amenity || kind,
        distance_m: haversine(lat, lng, eLat, eLng),
      };
    })
    .filter((p: NearbyPlace) => p.lat !== 0 && p.lng !== 0)
    .sort((a: NearbyPlace, b: NearbyPlace) => a.distance_m - b.distance_m)
    .slice(0, 20);
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${m} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export async function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) throw new Error('geocode failed');
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export { supabase };
