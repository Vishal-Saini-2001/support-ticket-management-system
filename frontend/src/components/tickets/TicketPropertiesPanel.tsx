'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { Ticket, User } from '@/types/api';
import { CALM_EASE } from '@/components/ui/motion';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';

interface TicketPropertiesPanelProps {
  ticket: Ticket;
  statusControl?: ReactNode;
  priorityControl?: ReactNode;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function TicketPropertiesPanel({
  ticket,
  statusControl,
  priorityControl,
}: TicketPropertiesPanelProps) {
  const creator =
    typeof ticket.createdBy === 'object' && ticket.createdBy !== null
      ? (ticket.createdBy as User)
      : null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: CALM_EASE }}
      aria-label="Ticket properties"
      className="rounded-md border border-border bg-background p-4 space-y-4"
    >
      <h2 className="text-[14px] font-semibold text-foreground">Properties</h2>

      <dl className="space-y-3 text-[13px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Status</dt>
          <dd>{statusControl ?? <StatusBadge status={ticket.status} />}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Priority</dt>
          <dd>{priorityControl ?? <PriorityBadge priority={ticket.priority} />}</dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Category</dt>
          <dd className="font-medium text-foreground">{ticket.category}</dd>
        </div>

        <div className="border-t border-border pt-3 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-muted">Created by</dt>
            <dd className="text-right">
              <div className="font-medium text-foreground">{creator?.name || 'User'}</div>
              {creator?.email ? (
                <div className="text-[11px] text-muted">{creator.email}</div>
              ) : null}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Created</dt>
            <dd className="text-[12px] text-foreground">{formatDateTime(ticket.createdAt)}</dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Updated</dt>
            <dd className="text-[12px] text-foreground">{formatDateTime(ticket.updatedAt)}</dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Resolved</dt>
            <dd className="text-[12px] text-foreground">{formatDateTime(ticket.resolvedAt)}</dd>
          </div>
        </div>
      </dl>
    </motion.aside>
  );
}

