'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

export function AuthHydration() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) {
      checkAuth();
    }
  }, [checkAuth, isHydrated]);

  return null; // This component doesn't render anything visually
}
