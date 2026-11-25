'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { FullScreenLoader } from '@/components/shared/FullScreenLoader';

interface RouteLoaderContextValue {
  isNavigating: boolean;
  startNavigation: (targetPath?: string) => void;
  stopNavigation: () => void;
}

const RouteLoaderContext = createContext<RouteLoaderContextValue | undefined>(undefined);

export function RouteLoaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const stopNavigation = useCallback(() => {
    clearTimer();
    setIsNavigating(false);
  }, [clearTimer]);

  const startNavigation = useCallback(
    (targetPath?: string) => {
      if (targetPath && targetPath === pathname) {
        return;
      }
      clearTimer();
      setIsNavigating(true);
      // Safety timeout so an aborted or same-route navigation never leaves the overlay stuck
      fallbackTimerRef.current = window.setTimeout(() => {
        setIsNavigating(false);
        fallbackTimerRef.current = null;
      }, 5000);
    },
    [clearTimer, pathname]
  );

  // Dismiss loader whenever the active pathname finishes changing
  useEffect(() => {
    stopNavigation();
  }, [pathname, stopNavigation]);

  // Intercept internal <Link> / <a> clicks and browser back/forward navigation
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

      const target = e.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }
      if (anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.origin);
        if (nextUrl.origin !== window.location.origin) {
          return;
        }
        if (nextUrl.pathname !== window.location.pathname) {
          startNavigation(nextUrl.pathname);
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    const handlePopState = () => {
      startNavigation();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
      clearTimer();
    };
  }, [clearTimer, startNavigation]);

  const value = useMemo(
    () => ({
      isNavigating,
      startNavigation,
      stopNavigation,
    }),
    [isNavigating, startNavigation, stopNavigation]
  );

  return (
    <RouteLoaderContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {isNavigating ? <FullScreenLoader overlay label="Navigating…" /> : null}
      </AnimatePresence>
    </RouteLoaderContext.Provider>
  );
}

export function useRouteLoader(): RouteLoaderContextValue {
  const ctx = useContext(RouteLoaderContext);
  if (!ctx) {
    throw new Error('useRouteLoader must be used within a RouteLoaderProvider');
  }
  return ctx;
}

