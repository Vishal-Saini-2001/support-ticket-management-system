import type { TicketStatus } from '@/types/api';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<TicketStatus, { label: string; pill: string; dot: string }> = {
  open: {
    label: 'Open',
    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  'in-progress': {
    label: 'In Progress',
    pill: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  resolved: {
    label: 'Resolved',
    pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
  closed: {
    label: 'Closed',
    pill: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    dot: 'bg-neutral-500 dark:bg-neutral-400',
  },
};

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.open;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-4',
        cfg.pill,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} aria-hidden="true" />
      {cfg.label}
    </span>
  );
}

