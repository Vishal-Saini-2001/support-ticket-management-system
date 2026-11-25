'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import { RouteLoaderProvider } from '@/context/RouteLoaderContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { TooltipProvider } from '@/components/ui/tooltip';

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="bottom-right" richColors closeButton />;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <RouteLoaderProvider>
            <AuthProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <ThemedToaster />
              </TooltipProvider>
            </AuthProvider>
          </RouteLoaderProvider>
        </MotionConfig>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
