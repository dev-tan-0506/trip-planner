'use client';

import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { Check, Loader2, MapPin, Search, X } from 'lucide-react';

interface PickedLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface LocationPickerProps {
  onConfirm: (location: PickedLocation) => void;
  onCancel: () => void;
  initialLat?: number;
  initialLng?: number;
  value: string;
  onValueChange: (value: string) => void;
}

const DynamicLocationPickerMap = dynamic(
  () => import('./LocationPickerMap').then((mod) => mod.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-56 w-full items-center justify-center bg-gray-50 text-sm text-gray-400">
        Đang tải bản đồ...
      </div>
    ),
  },
);

function formatReverseGeocodeAddress(address: Record<string, string | undefined>): string {
  const orderedParts = [
    address.road,
    address.suburb || address.neighbourhood || address.hamlet,
    address.city_district || address.county || address.town || address.city,
    address.state,
  ].filter(Boolean);

  return orderedParts.join(', ');
}

export function LocationPicker({
  onConfirm,
  onCancel,
  initialLat,
  initialLng,
  value,
  onValueChange,
}: LocationPickerProps) {
  const [pendingLocation, setPendingLocation] = useState<PickedLocation | null>(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng, name: value || undefined }
      : null,
  );
  const [resolvingAddress, setResolvingAddress] = useState(false);

  const center = useMemo<[number, number]>(() => {
    if (pendingLocation) {
      return [pendingLocation.lat, pendingLocation.lng];
    }

    return [16.0544, 108.2022];
  }, [pendingLocation]);

  const handleMapClick = useCallback(
    async ({ lat, lng }: { lat: number; lng: number }) => {
      setPendingLocation({
        lat,
        lng,
        name: value.trim() || undefined,
      });
      setResolvingAddress(true);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`,
        );

        if (!response.ok) {
          throw new Error('reverse_geocode_failed');
        }

        const data = (await response.json()) as {
          display_name?: string;
          address?: Record<string, string | undefined>;
        };

        const formattedAddress =
          (data.address ? formatReverseGeocodeAddress(data.address) : '') ||
          data.display_name ||
          '';

        if (formattedAddress) {
          onValueChange(formattedAddress);
          setPendingLocation({
            lat,
            lng,
            name: formattedAddress,
          });
        }
      } catch {
        // Keep the picked coordinate even if reverse geocoding fails.
      } finally {
        setResolvingAddress(false);
      }
    },
    [onValueChange, value],
  );

  const confirmLocation = useCallback(() => {
    if (!pendingLocation) return;
    onConfirm({
      ...pendingLocation,
      name: value.trim() || pendingLocation.name,
    });
  }, [onConfirm, pendingLocation, value]);

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-brand-blue" />
        <h3 className="text-sm font-bold text-gray-900">Chọn vị trí trên bản đồ</h3>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-bold text-gray-600">Tên địa điểm</span>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Ví dụ: Chợ đêm Sơn Trà, 123 Hai Bà Trưng..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-900"
          />
        </div>
      </label>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <DynamicLocationPickerMap
          center={center}
          pendingLocation={pendingLocation}
          onPick={handleMapClick}
        />
      </div>

      {pendingLocation ? (
        <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-3">
          <p className="text-xs font-bold text-brand-blue">Vị trí đã chọn</p>
          <p className="mt-1 text-sm text-gray-700">
            {resolvingAddress
              ? 'Đang lấy địa chỉ từ bản đồ...'
              : value || pendingLocation.name || 'Điểm vừa chọn trên bản đồ'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {pendingLocation.lat.toFixed(5)}, {pendingLocation.lng.toFixed(5)}
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-400">
          Bấm vào bản đồ để đặt vị trí, sau đó xác nhận mới lưu.
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200"
        >
          <X size={14} />
          Hủy
        </button>
        <button
          onClick={confirmLocation}
          disabled={!pendingLocation || resolvingAddress}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-blue py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {resolvingAddress ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {resolvingAddress ? 'Đang xử lý địa chỉ...' : 'Xác nhận vị trí'}
        </button>
      </div>
    </div>
  );
}
