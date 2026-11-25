'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  PaginatedResponse,
  Ticket,
  TicketPriority,
  TicketStatus,
} from '@/types/api';

export interface TicketListParams {
  status?: TicketStatus | '';
  priority?: TicketPriority | '';
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}

export interface UpdateTicketPayload {
  title: string;
  description: string;
  category: string;
}

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: TicketListParams) => [...ticketKeys.lists(), params] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

export function useTickets(params: TicketListParams) {
  return useQuery<PaginatedResponse<Ticket>>({
    queryKey: ticketKeys.list(params),
    queryFn: async () => {
      const cleanParams: Record<string, string | number> = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.status) {
        cleanParams.status = params.status;
      }
      if (params.priority) {
        cleanParams.priority = params.priority;
      }
      if (params.category) {
        cleanParams.category = params.category;
      }
      if (params.search) {
        cleanParams.search = params.search;
      }
      if (params.sort) {
        cleanParams.sort = params.sort;
      }

      const res = await api.get<PaginatedResponse<Ticket>>('/tickets', {
        params: cleanParams,
      });
      return res.data;
    },
  });
}

export function useTicket(ticketId: string) {
  return useQuery<Ticket>({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: async () => {
      const res = await api.get<{ data: Ticket }>(`/tickets/${ticketId}`);
      return res.data.data;
    },
    enabled: Boolean(ticketId),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTicketPayload) => {
      const res = await api.post<{ data: Ticket }>('/tickets', payload);
      return res.data.data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData(ticketKeys.detail(created._id), created);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateTicket(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateTicketPayload) => {
      const res = await api.put<{ data: Ticket }>(`/tickets/${ticketId}`, payload);
      return res.data.data;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) });
      const previous = queryClient.getQueryData<Ticket>(ticketKeys.detail(ticketId));
      if (previous) {
        queryClient.setQueryData<Ticket>(ticketKeys.detail(ticketId), {
          ...previous,
          ...updates,
        });
      }
      return { previous };
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), context.previous);
      }
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(ticketKeys.detail(ticketId), updated);
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      await api.delete(`/tickets/${ticketId}`);
      return ticketId;
    },
    onSuccess: (ticketId) => {
      queryClient.removeQueries({ queryKey: ticketKeys.detail(ticketId) });
      void queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

