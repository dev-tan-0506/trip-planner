'use client';

import { useState, useCallback } from 'react';
import { MapPin, Check, X } from 'lucide-react';

interface LocationPickerProps {
  onConfirm: (location: { lat: number; lng: number; name?: string }) => void;
  onCancel: () => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({ onConfirm, onCancel, initialLat, initialLng }: LocationPickerProps) {
  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lng: number;
    name?: string;
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setPendingLocation({ lat, lng });
  }, []);

  const confirmLocation = useCallback(() => {
    if (pendingLocation) {
      onConfirm(pendingLocation);
    }
  }, [pendingLocation, onConfirm]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2">
        <MapPin size={18} className="text-brand-blue" />
        <h3 className="font-bold text-gray-900 text-sm">Chọn vị trí</h3>
      </div>

      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Tìm kiếm địa điểm..."
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
      />

      {/* Pending location display */}
      {pendingLocation ? (
        <div className="bg-brand-blue/5 rounded-xl p-3 border border-brand-blue/20">
          <p className="text-xs font-bold text-brand-blue">Vị trí đã chọn:</p>
          <p className="text-sm text-gray-700 mt-1">
            {pendingLocation.lat.toFixed(6)}, {pendingLocation.lng.toFixed(6)}
          </p>
          {pendingLocation.name && (
            <p className="text-xs text-gray-500 mt-0.5">{pendingLocation.name}</p>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-400">
          Nhấn vào bản đồ để chọn vị trí
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
        >
          <X size={14} />
          Huỷ
        </button>
        <button
          onClick={confirmLocation}
          disabled={!pendingLocation}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-60"
        >
          <Check size={14} />
          Xác nhận
        </button>
      </div>
    </div>
  );
}
