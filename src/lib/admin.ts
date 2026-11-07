'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UsageSummary } from '@/lib/contracts';

export type RangeKey = 'today' | 'yesterday' | '7d' | '30d' | 'all';

export const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All time' },
];

const DAY = 86_400_000;

/** Midnight in the admin's own timezone, so "today" means their today. */
function localMidnight(daysAgo = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

/** The window for a preset, as the query the server expects. */
function windowFor(key: RangeKey): { from?: string; to?: string } {
  switch (key) {
    case 'today':
      return { from: localMidnight().toISOString() };
    case 'yesterday':
      return {
        from: localMidnight(1).toISOString(),
        to: localMidnight().toISOString(),
      };
    case '7d':
      return { from: new Date(Date.now() - 7 * DAY).toISOString() };
    case '30d':
      return { from: new Date(Date.now() - 30 * DAY).toISOString() };
    case 'all':
      return {};
  }
}

/** Usage + spend for one time window. Admin-only on the server; 403 otherwise. */
export function useUsage(range: RangeKey) {
  return useQuery({
    queryKey: ['admin', 'usage', range],
    queryFn: () => {
      const q = new URLSearchParams(
        windowFor(range) as Record<string, string>,
      ).toString();
      return api.get<UsageSummary>(`/admin/usage${q ? `?${q}` : ''}`);
    },
    refetchInterval: 60_000,
    placeholderData: (previous) => previous, // keep the old numbers on screen while the new range loads
    retry: false,
  });
}
