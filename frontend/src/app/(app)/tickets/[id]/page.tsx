'use client';

import { useParams } from 'next/navigation';
import { TicketDetailView } from '@/components/tickets/TicketDetailView';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <TicketDetailView
      ticketId={params.id}
      backHref="/tickets"
      backLabel="Back to my tickets"
    />
  );
}
