'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { itineraryApi, ItinerarySnapshot, tripsApi } from '../../lib/api-client';
import { ArrowLeft, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const focusedIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [35, 56],
  iconAnchor: [17, 56],
  popupAnchor: [1, -48],
  shadowSize: [56, 56],
  className: 'focused-marker',
});

const DAY_COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B59B6', '#E67E22', '#1ABC9C'];

function FlyToItem({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1 });
  }, [map, lat, lng]);
  return null;
}

export function TripMapScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const joinCode = params.joinCode as string;
  const focusItemId = searchParams.get('focusItemId');

  const [snapshot, setSnapshot] = useState<ItinerarySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);

  // Day filter with localStorage persistence
  const filterKey = `trip-map-day-filter:${joinCode}`;
  const [dayFilter, setDayFilter] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(filterKey);
    return stored !== null ? parseInt(stored) : null;
  });

  useEffect(() => {
    if (dayFilter !== null) {
      localStorage.setItem(filterKey, String(dayFilter));
    } else {
      localStorage.removeItem(filterKey);
    }
  }, [dayFilter, filterKey]);

  useEffect(() => {
    async function load() {
      try {
        const trip = await tripsApi.getByJoinCode(joinCode);
        setTripId(trip.id);
        const snap = await itineraryApi.getSnapshot(trip.id);
        setSnapshot(snap);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [joinCode]);

  const filteredMapItems = useMemo(() => {
    if (!snapshot) return [];
    const items = snapshot.mapItems;
    if (dayFilter !== null) {
      return items.filter((i) => i.dayIndex === dayFilter);
    }
    return items;
  }, [snapshot, dayFilter]);

  const polylinePositions = useMemo(() => {
    return filteredMapItems
      .sort((a, b) => a.dayIndex - b.dayIndex || a.sortOrder - b.sortOrder)
      .map((i) => [i.lat, i.lng] as [number, number]);
  }, [filteredMapItems]);

  const focusItem = focusItemId
    ? filteredMapItems.find((i) => i.id === focusItemId) ?? filteredMapItems[0]
    : null;

  const firstItem = filteredMapItems[0];
  const center: [number, number] = focusItem
    ? [focusItem.lat, focusItem.lng]
    : firstItem
      ? [firstItem.lat, firstItem.lng]
      : [16.054, 108.221]; // Default: Da Nang

  const uniqueDays = useMemo(() => {
    if (!snapshot) return [];
    return [...new Set(snapshot.mapItems.map((i) => i.dayIndex))].sort((a, b) => a - b);
  }, [snapshot]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="text-brand-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href={`/trip/${joinCode}`}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-lg font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
      </div>

      {/* Day Filter */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white rounded-xl shadow-lg p-1">
          <button
            onClick={() => setDayFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dayFilter === null ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Filter size={12} className="inline mr-1" />
            Tất cả
          </button>
          {uniqueDays.map((d) => (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dayFilter === d ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Ngày {d + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Item Count */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="bg-white rounded-xl shadow-lg px-4 py-2 text-xs font-bold text-gray-600">
          📍 {filteredMapItems.length} địa điểm
        </div>
      </div>

      {/* Map */}
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: dayFilter !== null ? DAY_COLORS[dayFilter % DAY_COLORS.length] : '#4D96FF',
              weight: 3,
              dashArray: '8, 8',
              opacity: 0.7,
            }}
          />
        )}

        {/* Markers */}
        {filteredMapItems.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={focusItemId === item.id ? focusedIcon : defaultIcon}
          >
            <Popup>
              <div className="text-sm space-y-1 min-w-[150px]">
                <p className="font-bold">{item.title}</p>
                <p className="text-gray-500 text-xs">
                  Ngày {item.dayIndex + 1} · #{item.sortOrder}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fly to focus item */}
        {focusItem && <FlyToItem lat={focusItem.lat} lng={focusItem.lng} />}
      </MapContainer>
    </div>
  );
}
