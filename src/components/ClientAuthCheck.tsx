"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ClientAuthCheckProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ClientAuthCheck({ 
  children, 
  fallback, 
  redirectTo = '/login' 
}: ClientAuthCheckProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated && redirectTo) {
      // Add the current path as a 'from' parameter for redirect back after login
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?from=${currentPath}`);
    }
  }, [isAuthenticated, loading, redirectTo, router]);

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
} 