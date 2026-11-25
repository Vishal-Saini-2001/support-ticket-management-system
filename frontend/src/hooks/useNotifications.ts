'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { NotificationItem } from '@/types/api';

export const notificationKeys = {
  all: ['notifications'] as const,
};

export function useNotifications(enabled = true) {
  return useQuery<NotificationItem[]>({
    queryKey: notificationKeys.all,
    queryFn: async () => {
      const res = await api.get<{ data: NotificationItem[] }>('/notifications');
      return res.data.data;
    },
    enabled,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await api.patch<{ data: NotificationItem }>(
        `/notifications/${notificationId}/read`
      );
      return res.data.data;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const previous = queryClient.getQueryData<NotificationItem[]>(notificationKeys.all);
      if (previous) {
        queryClient.setQueryData<NotificationItem[]>(
          notificationKeys.all,
          previous.map((item) =>
            item._id === notificationId ? { ...item, isRead: true } : item
          )
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.all, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

