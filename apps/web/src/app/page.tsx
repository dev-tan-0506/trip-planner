'use client';

import { useAuthStore } from '../store/useAuthStore';
import { LandingPage } from '../components/public-entry';

export default function Home() {
  const { user, isHydrated } = useAuthStore();

  if (!isHydrated) return null;

  return (
    <LandingPage 
      isAuthenticated={!!user} 
      userName={user?.name}
    />
  );
}
