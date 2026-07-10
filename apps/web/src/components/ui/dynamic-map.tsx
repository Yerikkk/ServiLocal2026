'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import type { MapLocation } from './location-map';

export const DynamicMap = dynamic(
  () => import('./location-map').then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-2xl animate-pulse flex items-center justify-center" style={{ background: 'var(--sl-border-light)' }}>
        <div className="flex flex-col items-center" style={{ color: 'var(--sl-text-muted)' }}>
          <MapPin className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Cargando mapa interactivo...</p>
        </div>
      </div>
    ),
  }
);
