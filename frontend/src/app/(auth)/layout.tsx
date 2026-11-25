'use client';

import type { ReactNode } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard mode="guest">
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
        {children}
      </div>
    </RouteGuard>
  );
}

