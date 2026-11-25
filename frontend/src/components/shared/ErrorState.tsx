import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while talking to the server.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-md border border-border bg-surface px-6 py-10 text-center',
        className
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="text-[16px] font-medium text-foreground">{title}</h2>
      <p className="mt-1 max-w-md text-[14px] text-muted">{message}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

