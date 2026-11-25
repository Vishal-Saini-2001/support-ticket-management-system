'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

