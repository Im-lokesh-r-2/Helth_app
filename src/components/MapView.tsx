import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface MapPin {
  lat: number;
  lng: number;
  label?: string;
  color?: 'blue' | 'red' | 'green' | 'orange';
}

interface MapViewProps {
  center: [number, number];
  pins?: MapPin[];
  route?: [number, number][];
  followDriver?: [number, number] | null;
  zoom?: number;
  className?: string;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function coloredIcon(color: string): L.DivIcon {
  const colors: Record<string, string> = {
    blue: '#0A84FF',
    red: '#EF4444',
    green: '#22C55E',
    orange: '#FF6B35',
  };
  const c = colors[color] || colors.blue;
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="width:24px;height:24px;background:${c};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export function MapView({ center, pins = [], route, followDriver, zoom = 14, className }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className || 'w-full h-full'}
      ref={mapRef as any}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {followDriver && <Recenter center={followDriver} />}

      {pins.map((pin, i) => (
        <Marker key={i} position={[pin.lat, pin.lng]} icon={coloredIcon(pin.color || 'blue')}>
          {pin.label && <Popup>{pin.label}</Popup>}
        </Marker>
      ))}

      {route && route.length >= 2 && (
        <Polyline positions={route} pathOptions={{ color: '#0A84FF', weight: 4, opacity: 0.7 }} />
      )}
    </MapContainer>
  );
}

export { MapContainer, Marker, TileLayer };
