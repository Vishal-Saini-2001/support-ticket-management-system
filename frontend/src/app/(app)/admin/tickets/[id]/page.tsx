'use client';

import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useUpdateTicketPriority, useUpdateTicketStatus } from '@/hooks/useAdminTickets';
import { extractApiError } from '@/lib/errors';
import type { Ticket, TicketPriority, TicketStatus } from '@/types/api';
import { TicketDetailView } from '@/components/tickets/TicketDetailView';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PriorityBadge } from '@/components/shared/PriorityBadge';

const STATUS_OPTIONS: TicketStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];

export default function AdminTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;

  const updateStatus = useUpdateTicketStatus(ticketId);
  const updatePriority = useUpdateTicketPriority(ticketId);

  const handleStatusChange = async (nextStatus: TicketStatus) => {
    try {
      await updateStatus.mutateAsync(nextStatus);
      toast.success(`Status updated to ${nextStatus}`);
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to update status').message);
    }
  };

  const handlePriorityChange = async (nextPriority: TicketPriority) => {
    try {
      await updatePriority.mutateAsync(nextPriority);
      toast.success(`Priority updated to ${nextPriority}`);
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to update priority').message);
    }
  };

  return (
    <TicketDetailView
      ticketId={ticketId}
      backHref="/admin/tickets"
      backLabel="Back to all tickets"
      renderStatusControl={(ticket: Ticket) => (
        <Select
          value={ticket.status}
          disabled={updateStatus.isPending}
          onValueChange={(val) => {
            void handleStatusChange(val as TicketStatus);
          }}
        >
          <SelectTrigger aria-label="Change ticket status" className="h-8 w-[150px] px-2">
            <SelectValue>
              <StatusBadge status={ticket.status} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      renderPriorityControl={(ticket: Ticket) => (
        <Select
          value={ticket.priority}
          disabled={updatePriority.isPending}
          onValueChange={(val) => {
            void handlePriorityChange(val as TicketPriority);
          }}
        >
          <SelectTrigger aria-label="Change ticket priority" className="h-8 w-[150px] px-2">
            <SelectValue>
              <PriorityBadge priority={ticket.priority} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((priority) => (
              <SelectItem key={priority} value={priority}>
                <PriorityBadge priority={priority} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}

