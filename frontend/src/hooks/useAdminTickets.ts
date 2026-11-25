'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ticketKeys } from '@/hooks/useTickets';
import { ticketDetailKeys } from '@/hooks/useTicketDetail';
import type { Ticket, TicketPriority, TicketStatus } from '@/types/api';

export function useUpdateTicketStatus(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: TicketStatus) => {
      const res = await api.patch<{ data: Ticket }>(`/tickets/${ticketId}/status`, { status });
      return res.data.data;
    },
    onMutate: async (status) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) });
      const previous = queryClient.getQueryData<Ticket>(ticketKeys.detail(ticketId));
      if (previous) {
        queryClient.setQueryData<Ticket>(ticketKeys.detail(ticketId), {
          ...previous,
          status,
          resolvedAt: status === 'resolved' ? new Date().toISOString() : previous.resolvedAt,
        });
      }
      return { previous };
    },
    onError: (_err, _status, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(ticketId), updated);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ticketDetailKeys.activity(ticketId) });
      }, 250);
    },
  });
}

export function useUpdateTicketPriority(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priority: TicketPriority) => {
      const res = await api.patch<{ data: Ticket }>(`/tickets/${ticketId}/priority`, {
        priority,
      });
      return res.data.data;
    },
    onMutate: async (priority) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) });
      const previous = queryClient.getQueryData<Ticket>(ticketKeys.detail(ticketId));
      if (previous) {
        queryClient.setQueryData<Ticket>(ticketKeys.detail(ticketId), {
          ...previous,
          priority,
        });
      }
      return { previous };
    },
    onError: (_err, _priority, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(ticketId), updated);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
      window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ticketDetailKeys.activity(ticketId) });
      }, 250);
    },
  });
}

