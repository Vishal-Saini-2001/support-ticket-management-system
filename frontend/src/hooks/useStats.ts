'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { TicketStats } from '@/types/api';

export function useStats(enabled = true) {
  return useQuery<TicketStats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get<TicketStats>('/stats');
      return res.data;
    },
    enabled,
  });
}

