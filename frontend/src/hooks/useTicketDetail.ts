'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ActivityLog, Comment } from '@/types/api';

export const ticketDetailKeys = {
  comments: (ticketId: string) => ['tickets', 'detail', ticketId, 'comments'] as const,
  activity: (ticketId: string) => ['tickets', 'detail', ticketId, 'activity'] as const,
};

export function useTicketComments(ticketId: string) {
  return useQuery<Comment[]>({
    queryKey: ticketDetailKeys.comments(ticketId),
    queryFn: async () => {
      const res = await api.get<{ data: Comment[] }>(`/tickets/${ticketId}/comments`);
      return res.data.data;
    },
    enabled: Boolean(ticketId),
  });
}

export function useTicketActivity(ticketId: string) {
  return useQuery<ActivityLog[]>({
    queryKey: ticketDetailKeys.activity(ticketId),
    queryFn: async () => {
      const res = await api.get<{ data: ActivityLog[] }>(`/tickets/${ticketId}/activity`);
      return res.data.data;
    },
    enabled: Boolean(ticketId),
  });
}

export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post<{ data: Comment }>(`/tickets/${ticketId}/comments`, {
        message,
      });
      return res.data.data;
    },
    onMutate: async (message: string) => {
      const key = ticketDetailKeys.comments(ticketId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Comment[]>(key);

      if (user) {
        const optimisticComment: Comment = {
          _id: `optimistic-${Date.now()}`,
          ticket: ticketId,
          author: user,
          message,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<Comment[]>(key, [...(previous ?? []), optimisticComment]);
      }

      return { previous };
    },
    onError: (_error, _message, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ticketDetailKeys.comments(ticketId), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ticketDetailKeys.comments(ticketId) });
      // Slight delay lets the async EventEmitter listener persist the COMMENT_ADDED activity log
      window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ticketDetailKeys.activity(ticketId) });
      }, 250);
    },
  });
}

