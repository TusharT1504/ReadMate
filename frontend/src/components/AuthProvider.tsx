'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  // Don't block rendering with loading state - let pages handle their own auth
  return <>{children}</>;
}
