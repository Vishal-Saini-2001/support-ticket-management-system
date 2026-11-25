'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteLoader } from '@/context/RouteLoaderContext';

export function useAppRouter() {
  const router = useRouter();
  const { startNavigation } = useRouteLoader();

  const push = useCallback(
    (href: string) => {
      const targetPath = href.split('?')[0];
      startNavigation(targetPath);
      router.push(href);
    },
    [router, startNavigation]
  );

  const replace = useCallback(
    (href: string, options?: { scroll?: boolean }) => {
      const targetPath = href.split('?')[0];
      startNavigation(targetPath);
      router.replace(href, options);
    },
    [router, startNavigation]
  );

  const back = useCallback(() => {
    startNavigation();
    router.back();
  }, [router, startNavigation]);

  return useMemo(() => ({ push, replace, back }), [push, replace, back]);
}

