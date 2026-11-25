'use client';

import { History } from 'lucide-react';
import { motion } from 'framer-motion';
import { CALM_EASE } from '@/components/ui/motion';
import { useTicketActivity } from '@/hooks/useTicketDetail';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/utils';
import type { ActivityLog } from '@/types/api';
import { Skeleton } from '@/components/ui/skeleton';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { ErrorState } from '@/components/shared/ErrorState';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function formatActivitySentence(log: ActivityLog): string {
  const actorName = log.actor?.name || 'Someone';
  const meta = isRecord(log.meta) ? log.meta : {};
  const oldValues = isRecord(meta.old) ? meta.old : {};
  const newValues = isRecord(meta.new) ? meta.new : {};

  switch (log.action) {
    case 'TICKET_CREATED':
      return `${actorName} created this ticket`;
    case 'STATUS_CHANGED': {
      const fromStatus = typeof oldValues.status === 'string' ? oldValues.status : 'previous';
      const toStatus = typeof newValues.status === 'string' ? newValues.status : 'updated';
      return `${actorName} changed status from ${fromStatus} to ${toStatus}`;
    }
    case 'TICKET_RESOLVED':
      return `${actorName} marked this ticket as resolved`;
    case 'COMMENT_ADDED':
      return `${actorName} added a comment`;
    case 'TICKET_UPDATED': {
      if (typeof newValues.priority === 'string') {
        const fromPriority =
          typeof oldValues.priority === 'string' ? oldValues.priority : 'previous';
        return `${actorName} changed priority from ${fromPriority} to ${newValues.priority}`;
      }
      const changedFields = Object.keys(newValues);
      if (changedFields.length > 0) {
        return `${actorName} updated ${changedFields.join(', ')}`;
      }
      return `${actorName} updated ticket details`;
    }
    default:
      return `${actorName} performed an action`;
  }
}

export function ActivityTimeline({ ticketId }: { ticketId: string }) {
  const activityQuery = useTicketActivity(ticketId);
  const logs = activityQuery.data ?? [];

  return (
    <section
      aria-labelledby="activity-heading"
      className="rounded-md border border-border bg-background p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted" aria-hidden="true" />
        <h2 id="activity-heading" className="text-[14px] font-semibold text-foreground">
          Activity
        </h2>
      </div>

      {activityQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <Skeleton className="mt-1 h-2 w-2 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : activityQuery.isError ? (
        <ErrorState
          title="Could not load activity"
          message={extractApiError(activityQuery.error).message}
          onRetry={() => {
            void activityQuery.refetch();
          }}
        />
      ) : logs.length === 0 ? (
        <p className="py-2 text-[13px] text-muted">No activity recorded yet.</p>
      ) : (
        <ol className="relative space-y-3.5">
          {logs.length > 1 ? (
            <span
              className="absolute bottom-5 left-1 top-2 w-px -translate-x-1/2 bg-border"
              aria-hidden="true"
            />
          ) : null}
          {logs.map((log, index) => (
            <motion.li
              key={log._id}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.16, delay: Math.min(index * 0.025, 0.15), ease: CALM_EASE }}
              className="relative pl-5"
            >
              <span
                className="absolute left-1 top-[5px] h-2 w-2 -translate-x-1/2 rounded-full bg-muted ring-2 ring-background"
                aria-hidden="true"
              />
              <p className="text-[13px] leading-snug text-foreground">
                {formatActivitySentence(log)}
              </p>
              <SimpleTooltip label={new Date(log.createdAt).toLocaleString()}>
                <time
                  dateTime={log.createdAt}
                  className="mt-0.5 inline-block cursor-default text-[11px] text-muted"
                >
                  {formatRelativeTime(log.createdAt)}
                </time>
              </SimpleTooltip>
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  );
}

