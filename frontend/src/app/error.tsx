'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h1 className="text-[24px] font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-2 max-w-md text-[14px] text-muted">
        {error.message || 'An unexpected error occurred while rendering this page.'}
      </p>
      <div className="mt-6">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </div>
  );
}

