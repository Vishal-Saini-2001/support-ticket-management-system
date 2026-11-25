'use client';

import type { ReactNode } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { AppShell } from '@/components/layout/AppShell';

export default function ProtectedAppLayout({ children }: { children: ReactNode }) {
  return (
    <RouteGuard mode="protected">
      <AppShell>{children}</AppShell>
    </RouteGuard>
  );
}

