'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAppRouter } from '@/hooks/useAppRouter';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteTicket, useTicket, useUpdateTicket } from '@/hooks/useTickets';
import { extractApiError } from '@/lib/errors';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TicketForm, type TicketFormValues } from '@/components/tickets/TicketForm';
import { DeleteTicketDialog } from '@/components/tickets/DeleteTicketDialog';

export default function EditTicketPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;
  const router = useAppRouter();
  const { user } = useAuth();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const ticketQuery = useTicket(ticketId);
  const updateTicket = useUpdateTicket(ticketId);
  const deleteTicket = useDeleteTicket();

  if (ticketQuery.isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          title="Unable to load ticket"
          message={extractApiError(ticketQuery.error, 'Ticket could not be retrieved').message}
          onRetry={() => {
            void ticketQuery.refetch();
          }}
        />
      </div>
    );
  }

  const ticket = ticketQuery.data;
  const canModify = user?.role === 'admin' || ticket.status === 'open';
  const lockedReason = 'Tickets can only be edited or deleted while status is open.';

  const handleUpdate = async (values: TicketFormValues) => {
    await updateTicket.mutateAsync({
      title: values.title,
      description: values.description,
      category: values.category,
    });
    toast.success('Ticket updated');
    router.push(`/tickets/${ticketId}`);
  };

  const handleDelete = async () => {
    try {
      await deleteTicket.mutateAsync(ticketId);
      toast.success('Ticket deleted');
      setDeleteDialogOpen(false);
      router.push('/tickets');
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to delete ticket').message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href={`/tickets/${ticketId}`}>
          <Button variant="ghost" size="sm" className="-ml-2 mb-3 text-muted">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to ticket
          </Button>
        </Link>

        <PageHeader
          title="Edit Ticket"
          description="Update the ticket details below."
          actions={<StatusBadge status={ticket.status} />}
        />
      </div>

      <TicketForm
        mode="edit"
        initialTicket={ticket}
        canModify={canModify}
        lockedReason={lockedReason}
        onSubmitValues={handleUpdate}
        onCancel={() => router.push(`/tickets/${ticketId}`)}
        onRequestDelete={() => setDeleteDialogOpen(true)}
      />

      <DeleteTicketDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ticketTitle={ticket.title}
        isDeleting={deleteTicket.isPending}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}

