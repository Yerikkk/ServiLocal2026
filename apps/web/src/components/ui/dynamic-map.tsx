'use client';

import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import type { MapLocation } from './location-map';

export const DynamicMap = dynamic(
  () => import('./location-map').then((mod) => mod.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
          <MapPin className="h-8 w-8 mb-2" />
          <p className="text-sm font-medium">Cargando mapa interactivo...</p>
        </div>
      </div>
    ),
  }
);
