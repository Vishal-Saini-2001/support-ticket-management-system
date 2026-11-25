'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCreateTicket } from '@/hooks/useTickets';
import { PageHeader } from '@/components/shared/PageHeader';
import { TicketForm, type TicketFormValues } from '@/components/tickets/TicketForm';

export default function NewTicketPage() {
  const router = useRouter();
  const createTicket = useCreateTicket();

  const handleSubmit = async (values: TicketFormValues) => {
    const created = await createTicket.mutateAsync(values);
    toast.success('Ticket created');
    router.push(`/tickets/${created._id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="New Ticket"
        description="Describe the issue clearly so our support team can resolve it quickly."
      />

      <TicketForm
        mode="create"
        onSubmitValues={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

