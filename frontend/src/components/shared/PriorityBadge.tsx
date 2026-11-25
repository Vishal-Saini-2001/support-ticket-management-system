import type { TicketPriority } from '@/types/api';
import { cn } from '@/lib/utils';

const PRIORITY_STYLES: Record<TicketPriority, { label: string; pill: string; dot: string }> = {
  low: {
    label: 'Low',
    pill: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    dot: 'bg-neutral-500 dark:bg-neutral-400',
  },
  medium: {
    label: 'Medium',
    pill: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  high: {
    label: 'High',
    pill: 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    dot: 'bg-orange-500 dark:bg-orange-400',
  },
  urgent: {
    label: 'Urgent',
    pill: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300',
    dot: 'bg-red-600 dark:bg-red-400',
  },
};

export function PriorityBadge({ priority, className }: { priority: TicketPriority; className?: string }) {
  const cfg = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
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

