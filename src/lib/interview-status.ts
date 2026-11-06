'use client';

import { useEffect, useState } from 'react';
import type { InterviewSummary } from '@/lib/contracts';

/** Re-renders every `ms`, so "closes in 4 min" stays honest without a refetch. */
export function useNow(ms = 20_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export interface InterviewAccess {
  /** Still open: you can walk back into the room. */
  open: boolean;
  /** Where clicking it should go. */
  href: string;
  /** One or two words for tight spaces: Join, Rejoin, In progress, Not started… */
  short: string;
  /** Longer, with the countdown when there is one. */
  detail: string;
  /** Join/Rejoin deserve emphasis; the rest are quiet. */
  tone: 'action' | 'live' | 'muted' | 'plain';
}

const minutesLeft = (iso: string | null, now: number): number | null =>
  iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 60_000)) : null;

const mins = (m: number) => (m <= 1 ? 'under a minute' : `${m} min`);

/** What a row in the sidebar / dashboard should say and where it should lead. */
export function accessFor(i: InterviewSummary, now: number): InterviewAccess {
  const room = `/interview/${i.id}`;
  const report = `/interviews/${i.id}`;
  const left = minutesLeft(i.returnBy, now);

  if (i.status === 'planned') {
    return {
      open: true,
      href: room,
      short: 'Join',
      detail:
        left === null
          ? 'Ready to join'
          : `Ready to join · closes in ${mins(left)}`,
      tone: 'action',
    };
  }
  if (i.status === 'live') {
    if (left !== null) {
      return {
        open: true,
        href: room,
        short: 'Rejoin',
        detail: `Rejoin within ${mins(left)}`,
        tone: 'action',
      };
    }
    return {
      open: true,
      href: room,
      short: 'In progress',
      detail: 'In progress',
      tone: 'live',
    };
  }
  if (i.status === 'not_started') {
    return {
      open: false,
      href: report,
      short: 'Not started',
      detail: 'Not started',
      tone: 'muted',
    };
  }
  if (i.status === 'abandoned') {
    return {
      open: false,
      href: report,
      short: 'Ended early',
      detail: 'Ended early',
      tone: 'plain',
    };
  }
  return {
    open: false,
    href: report,
    short: 'Report pending',
    detail: 'Report pending',
    tone: 'plain',
  };
}
