'use client';

import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface LocationPickerMapProps {
  center: [number, number];
  pendingLocation: { lat: number; lng: number } | null;
  onPick: (location: { lat: number; lng: number }) => void;
}

const markerIcon = L.divIcon({
  className: 'location-picker-marker',
  html: '<div style="width:18px;height:18px;border-radius:999px;background:#FF6B6B;border:4px solid #fff;box-shadow:0 8px 18px rgba(255,107,107,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickToPick({
  onPick,
}: {
  onPick: (location: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

export function LocationPickerMap({
  center,
  pendingLocation,
  onPick,
}: LocationPickerMapProps) {
  return (
    <MapContainer center={center} zoom={13} className="h-56 w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPick onPick={onPick} />
      {pendingLocation && (
        <Marker position={[pendingLocation.lat, pendingLocation.lng]} icon={markerIcon} />
      )}
    </MapContainer>
  );
}
