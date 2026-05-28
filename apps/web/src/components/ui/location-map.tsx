'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix leaflet icon issue in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export type MapLocation = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
};

type LocationMapProps = {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
};

// Default center to Talara, Peru
const DEFAULT_CENTER: [number, number] = [-4.5772, -81.2719];

export function LocationMap({
  locations,
  center = DEFAULT_CENTER,
  zoom = 13,
  height = '400px',
  className,
}: LocationMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className={`w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center text-slate-400">
          <MapPin className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic center based on locations if multiple
  const mapCenter = locations.length === 1 ? [locations[0].lat, locations[0].lng] as [number, number] : center;

  return (
    <div className={`w-full overflow-hidden rounded-2xl border border-[var(--sl-border)] shadow-sm ${className}`} style={{ height, zIndex: 0 }}>
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc) => (
          <Marker 
            key={loc.id} 
            position={[loc.lat, loc.lng]}
            icon={customIcon}
          >
            <Popup className="rounded-xl">
              <div className="p-1">
                <h3 className="font-bold text-slate-900">{loc.title}</h3>
                {loc.description && (
                  <p className="text-xs text-slate-600 mt-1">{loc.description}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
