'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { ArrowLeft, Filter, Loader2 } from 'lucide-react';
import { itineraryApi, ItinerarySnapshot, tripsApi } from '../../lib/api-client';

const defaultIcon = L.divIcon({
  className: 'trip-map-marker',
  html: '<div style="width:16px;height:16px;border-radius:999px;background:#4D96FF;border:3px solid #fff;box-shadow:0 8px 20px rgba(77,150,255,.3)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const focusedIcon = L.divIcon({
  className: 'trip-map-marker trip-map-marker--focused',
  html: '<div style="width:20px;height:20px;border-radius:999px;background:#FF6B6B;border:4px solid #fff;box-shadow:0 10px 22px rgba(255,107,107,.35)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const DAY_COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#9B59B6', '#E67E22', '#1ABC9C'];
const DEFAULT_CENTER: [number, number] = [16.054, 108.221];

function FlyToItem({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 16, { duration: 1 });
  }, [lat, lng, map]);

  return null;
}

export function TripMapScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const joinCode = params.joinCode as string;
  const focusItemId = searchParams.get('focusItemId');

  const [snapshot, setSnapshot] = useState<ItinerarySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dayFilter, setDayFilter] = useState<number | null>(null);

  const filterKey = `trip-map-day-filter:${joinCode}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(filterKey);
    if (!stored) return;
    const parsed = Number.parseInt(stored, 10);
    setDayFilter(Number.isNaN(parsed) ? null : parsed);
  }, [filterKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (dayFilter === null) {
      window.localStorage.removeItem(filterKey);
      return;
    }
    window.localStorage.setItem(filterKey, String(dayFilter));
  }, [dayFilter, filterKey]);

  useEffect(() => {
    async function load() {
      try {
        const trip = await tripsApi.getByJoinCode(joinCode);
        const snap = await itineraryApi.getSnapshot(trip.id);
        setSnapshot(snap);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải bản đồ chuyến đi');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [joinCode]);

  const filteredMapItems = useMemo(() => {
    if (!snapshot) return [];
    const items = [...snapshot.mapItems];
    if (dayFilter === null) return items;
    return items.filter((item) => item.dayIndex === dayFilter);
  }, [dayFilter, snapshot]);

  const polylinePositions = useMemo(
    () =>
      [...filteredMapItems]
        .sort((a, b) => a.dayIndex - b.dayIndex || a.sortOrder - b.sortOrder)
        .map((item) => [item.lat, item.lng] as [number, number]),
    [filteredMapItems],
  );

  const focusItem = focusItemId
    ? filteredMapItems.find((item) => item.id === focusItemId) ?? filteredMapItems[0]
    : filteredMapItems[0];

  const center: [number, number] = focusItem
    ? [focusItem.lat, focusItem.lng]
    : polylinePositions[0] ?? DEFAULT_CENTER;

  const uniqueDays = useMemo(() => {
    if (!snapshot) return [];
    return [...new Set(snapshot.mapItems.map((item) => item.dayIndex))].sort((a, b) => a - b);
  }, [snapshot]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-blue/5 p-6">
        <div className="max-w-md w-full rounded-3xl bg-white p-8 text-center shadow-xl space-y-4">
          <p className="text-lg font-black text-gray-900">Không mở được bản đồ</p>
          <p className="text-sm text-gray-500">{error}</p>
          <Link
            href={`/trip/${joinCode}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-5 py-3 font-bold text-white"
          >
            <ArrowLeft size={16} />
            Quay lại lịch trình
          </Link>
        </div>
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-4 left-4 z-[1000]">
        <Link
          href={`/trip/${joinCode}`}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-lg transition-all hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Link>
      </div>

      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-lg">
          <button
            onClick={() => setDayFilter(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              dayFilter === null ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Filter size={12} className="inline mr-1" />
            Tất cả
          </button>
          {uniqueDays.map((day) => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                dayFilter === day ? 'bg-brand-dark text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              Ngày {day + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000]">
        <div className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-lg">
          📍 {filteredMapItems.length} địa điểm
        </div>
      </div>

      {filteredMapItems.length === 0 ? (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-blue/5">
          <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg">
            <p className="text-lg font-black text-gray-900">Chưa có điểm nào để hiển thị</p>
            <p className="mt-2 text-sm text-gray-500">
              Hãy thêm tọa độ cho hoạt động hoặc bỏ bộ lọc ngày để xem toàn bộ hành trình.
            </p>
          </div>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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

          {filteredMapItems.map((item) => (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={focusItemId === item.id ? focusedIcon : defaultIcon}
            >
              <Popup>
                <div className="min-w-[150px] space-y-1 text-sm">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-xs text-gray-500">
                    Ngày {item.dayIndex + 1} · #{item.sortOrder}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {focusItem && <FlyToItem lat={focusItem.lat} lng={focusItem.lng} />}
        </MapContainer>
      )}
    </div>
  );
}
