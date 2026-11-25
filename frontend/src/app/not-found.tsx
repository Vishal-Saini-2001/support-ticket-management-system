import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-surface text-muted">
        <FileQuestion className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-[12px] font-medium uppercase tracking-wider text-muted">404</p>
      <h1 className="mt-1 text-[24px] font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 max-w-md text-[14px] text-muted">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <Link href="/">
          <Button>Return home</Button>
        </Link>
      </div>
    </div>
  );
}

