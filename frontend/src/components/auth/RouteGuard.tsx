'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  mode: 'protected' | 'guest';
  children: ReactNode;
}

function getAdminRedirectPath(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname === '/tickets/new') {
    return '/admin/dashboard';
  }
  if (pathname === '/tickets') {
    return '/admin/tickets';
  }
  if (pathname.startsWith('/tickets/')) {
    if (pathname.endsWith('/edit')) {
      return '/admin/tickets';
    }
    return `/admin${pathname}`;
  }
  return null;
}

export function RouteGuard({ mode, children }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const adminRedirect = user?.role === 'admin' ? getAdminRedirectPath(pathname) : null;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (mode === 'protected') {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (pathname.startsWith('/admin') && user?.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }
      if (adminRedirect) {
        router.replace(adminRedirect);
      }
      return;
    }

    if (mode === 'guest' && isAuthenticated && user) {
      router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    }
  }, [adminRedirect, isAuthenticated, isLoading, mode, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (mode === 'protected') {
    if (!isAuthenticated) {
      return null;
    }
    if (pathname.startsWith('/admin') && user?.role !== 'admin') {
      return null;
    }
    if (adminRedirect) {
      return null;
    }
  }

  if (mode === 'guest' && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

