'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PlanSection } from '@/lib/contracts';

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Minimal meeting header: what this is, where you are in it, and the clock. */
export function TopBar({
  role,
  sections,
  sectionIdx,
  secondsLeft,
  live,
  done,
}: {
  role: string;
  sections: PlanSection[];
  sectionIdx: number;
  secondsLeft: number | null;
  live: boolean;
  done: boolean;
}) {
  const current = sections[sectionIdx];

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Image src="/logo.png" alt="Intervio" width={24} height={24} priority />
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          Intervio<span className="text-muted-foreground">.ai</span>
        </span>
        {role && (
          <>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <span className="truncate text-sm text-muted-foreground">{role} interview</span>
          </>
        )}
      </div>

      {/* Where you are in the interview — hidden on small screens to keep it calm. */}
      {sections.length > 0 && !done && (
        <div className="hidden w-72 flex-col gap-1.5 md:flex">
          <span className="text-center text-xs font-medium">{current?.title ?? 'Getting started'}</span>
          <div className="flex gap-1">
            {sections.map((s, i) => (
              <span
                key={s.key}
                title={s.title}
                style={{ flex: s.budgetMin }}
                className={cn(
                  'h-1 rounded-full transition-colors',
                  i < sectionIdx ? 'bg-primary/55' : i === sectionIdx ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 items-center justify-end gap-2">
        {live && !done && (
          <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--hangup)]" aria-hidden />
            <span className="font-mono text-xs tabular-nums text-foreground/85">
              {secondsLeft !== null ? `${clock(secondsLeft)} left` : 'Live'}
            </span>
          </span>
        )}
      </div>
    </header>
  );
}
