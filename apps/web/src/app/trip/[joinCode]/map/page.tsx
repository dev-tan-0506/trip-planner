'use client';

import dynamic from 'next/dynamic';

const TripMapScreen = dynamic(
  () => import('../../../../components/trip/TripMapScreen').then((m) => m.TripMapScreen),
  { ssr: false, loading: () => <div className="flex items-center justify-center min-h-screen"><p className="text-gray-500">Đang tải bản đồ...</p></div> },
);

export default function TripMapPage() {
  return <TripMapScreen />;
}
