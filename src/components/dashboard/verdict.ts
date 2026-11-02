import type { Verdict } from '@/lib/contracts';

/** One wording + colour per verdict, shared by every dashboard surface. */
export const VERDICT: Record<Verdict, { label: string; short: string; color: string }> = {
  ready: { label: 'Ready', short: 'Ready', color: 'var(--success)' },
  almost: { label: 'Almost there', short: 'Almost', color: 'var(--warning)' },
  not_ready: { label: 'Not ready yet', short: 'Not ready', color: 'var(--destructive)' },
};

/** Fixed locale, so the server render and the browser always agree. */
export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(iso).toLocaleDateString('en-GB', opts);
