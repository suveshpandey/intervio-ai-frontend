'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UsageSummary } from '@/lib/contracts';

/** Usage + spend for the admin page. Admin-only on the server; 403 otherwise. */
export function useUsage() {
  return useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: () => api.get<UsageSummary>('/admin/usage'),
    refetchInterval: 60_000,
    retry: false,
  });
}
