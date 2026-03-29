'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import type { AttendanceSnapshot } from '../../lib/api-client';

interface AttendanceMapCanvasProps {
  snapshot: AttendanceSnapshot;
}

const meetingIcon = L.divIcon({
  className: 'attendance-meeting-marker',
  html: '<div style="width:18px;height:18px;border-radius:999px;background:#1A4D8F;border:4px solid #fff;box-shadow:0 8px 18px rgba(26,77,143,.28)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const memberIcon = L.divIcon({
  className: 'attendance-member-marker',
  html: '<div style="width:14px;height:14px;border-radius:999px;background:#FFB84D;border:3px solid #fff;box-shadow:0 6px 12px rgba(255,184,77,.28)"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export function AttendanceMapCanvas({ snapshot }: AttendanceMapCanvasProps) {
  const session = snapshot.session;
  const center: [number, number] =
    session?.lat != null && session?.lng != null
      ? [session.lat, session.lng]
      : snapshot.mapPoints[0]
        ? [snapshot.mapPoints[0].lat, snapshot.mapPoints[0].lng]
        : [16.0544, 108.2022];

  return (
    <MapContainer center={center} zoom={13} className="h-[320px] w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {session?.lat != null && session?.lng != null && (
        <Marker position={[session.lat, session.lng]} icon={meetingIcon}>
          <Popup>
            <div>
              <p className="font-bold">{session.meetingLabel}</p>
              <p>{session.meetingAddress}</p>
            </div>
          </Popup>
        </Marker>
      )}
      {snapshot.mapPoints.map((point) => (
        <Marker key={point.tripMemberId} position={[point.lat, point.lng]} icon={memberIcon}>
          <Popup>
            <div>
              <p className="font-bold">{point.name || 'Thành viên'}</p>
              <p>{point.status === 'ARRIVED' ? 'Đã đến' : 'Thiếu vị trí rõ ràng'}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
