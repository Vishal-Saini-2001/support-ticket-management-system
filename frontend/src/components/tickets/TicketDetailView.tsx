'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteTicket, useTicket } from '@/hooks/useTickets';
import { extractApiError } from '@/lib/errors';
import { formatRelativeTime } from '@/lib/utils';
import type { Ticket } from '@/types/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteTicketDialog } from '@/components/tickets/DeleteTicketDialog';
import { CommentsSection } from '@/components/tickets/CommentsSection';
import { TicketPropertiesPanel } from '@/components/tickets/TicketPropertiesPanel';
import { ActivityTimeline } from '@/components/tickets/ActivityTimeline';

interface TicketDetailViewProps {
  ticketId: string;
  backHref: string;
  backLabel: string;
  renderStatusControl?: (ticket: Ticket) => ReactNode;
  renderPriorityControl?: (ticket: Ticket) => ReactNode;
}

export function TicketDetailView({
  ticketId,
  backHref,
  backLabel,
  renderStatusControl,
  renderPriorityControl,
}: TicketDetailViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const ticketQuery = useTicket(ticketId);
  const deleteTicket = useDeleteTicket();

  if (ticketQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-2/3" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-56 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <div className="space-y-4">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="-ml-2 text-muted">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Button>
        </Link>
        <ErrorState
          title="Unable to load ticket"
          message={extractApiError(ticketQuery.error, 'Ticket not found').message}
          onRetry={() => {
            void ticketQuery.refetch();
          }}
        />
      </div>
    );
  }

  const ticket = ticketQuery.data;
  const isAdmin = user?.role === 'admin';
  const canModify = isAdmin || ticket.status === 'open';
  const lockedReason = 'Tickets can only be edited or deleted while status is open.';

  const handleDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticketId);
      toast.success('Ticket deleted');
      setDeleteOpen(false);
      router.push(backHref);
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to delete ticket').message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref}>
          <Button variant="ghost" size="sm" className="-ml-2 mb-3 text-muted">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Button>
        </Link>

        <PageHeader
          title={ticket.title}
          description={`Ticket #${ticket._id.slice(-6)} · Updated ${formatRelativeTime(ticket.updatedAt)}`}
          actions={
            <div className="flex items-center gap-2">
              {!isAdmin ? (
                canModify ? (
                  <Link href={`/tickets/${ticketId}/edit`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                  </Link>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0} className="inline-block">
                        <Button variant="secondary" size="sm" disabled>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{lockedReason}</TooltipContent>
                  </Tooltip>
                )
              ) : null}

              {canModify ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeleteOpen(true)}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="inline-block">
                      <Button variant="secondary" size="sm" disabled>
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{lockedReason}</TooltipContent>
                </Tooltip>
              )}
            </div>
          }
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Left: Description + Comments */}
        <div className="space-y-6 min-w-0">
          <section
            aria-label="Ticket description"
            className="rounded-md border border-border bg-background p-6"
          >
            <h2 className="mb-2 text-[12px] font-medium uppercase tracking-wider text-muted">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">
              {ticket.description}
            </p>
          </section>

          <CommentsSection ticketId={ticketId} />
        </div>

        {/* Right: Properties + Activity Timeline */}
        <div className="space-y-5">
          <TicketPropertiesPanel
            ticket={ticket}
            statusControl={renderStatusControl ? renderStatusControl(ticket) : undefined}
            priorityControl={renderPriorityControl ? renderPriorityControl(ticket) : undefined}
          />
          <ActivityTimeline ticketId={ticketId} />
        </div>
      </div>

      <DeleteTicketDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ticketTitle={ticket.title}
        isDeleting={deleteTicket.isPending}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}

