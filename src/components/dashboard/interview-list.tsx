'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/icons';
import { VERDICT, formatDay } from '@/components/dashboard/verdict';
import type { InterviewSummary } from '@/lib/contracts';

/** Shown before "Show all" — the full history also lives in the sidebar. */
const INITIAL = 6;

/** A small meter: one segment per claim probed, filled for each one backed up. */
function ClaimMeter({ supported, probed }: { supported: number; probed: number }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: probed }, (_, i) => (
          <span
            key={i}
            className="h-1.5 w-3.5 rounded-full"
            style={{ background: i < supported ? 'var(--success)' : 'var(--border)' }}
          />
        ))}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
        {supported}/{probed}
      </span>
    </span>
  );
}

/** What to say on the right when there's no verdict to show. */
function statusText(i: InterviewSummary): string {
  if (i.status === 'live') return 'In progress';
  if (i.status === 'abandoned') return 'Ended early';
  return 'Report pending';
}

function Row({ interview }: { interview: InterviewSummary }) {
  const live = interview.status === 'live';
  const verdict = interview.verdict ? VERDICT[interview.verdict] : null;
  const href = live ? `/interview/${interview.id}` : `/interviews/${interview.id}`;

  return (
    <li>
      <Link
        href={href}
        className="group grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50 sm:grid-cols-[3rem_minmax(0,1fr)_8.5rem_7.5rem_1rem]"
      >
        {/* Date, like a diary margin. */}
        <span className="text-center leading-none">
          <span className="block text-lg font-semibold tabular-nums">
            {formatDay(interview.createdAt, { day: '2-digit' })}
          </span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {formatDay(interview.createdAt, { month: 'short' })}
          </span>
        </span>

        <span className="min-w-0">
          <span className="block truncate text-[15px] font-medium">{interview.role}</span>
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {interview.turnCount} question{interview.turnCount === 1 ? '' : 's'} · {interview.durationMin} min
          </span>
        </span>

        <span className="hidden sm:block">
          {interview.claims ? (
            <ClaimMeter supported={interview.claims.claimsSupported} probed={interview.claims.claimsProbed} />
          ) : (
            <span className="font-mono text-[11px] text-muted-foreground/50">—</span>
          )}
        </span>

        {/* Verdict as words in its colour — no pills. */}
        <span className="flex items-center justify-end gap-2 text-sm sm:justify-start">
          {verdict ? (
            <>
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: verdict.color }} />
              <span style={{ color: verdict.color }}>{verdict.short}</span>
            </>
          ) : (
            <>
              {live && <span aria-hidden className="live-dot h-1.5 w-1.5 rounded-full bg-success" />}
              <span className="text-muted-foreground">{statusText(interview)}</span>
            </>
          )}
        </span>

        <ChevronRightIcon className="hidden h-4 w-4 text-muted-foreground/30 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/70 sm:block" />
      </Link>
    </li>
  );
}

export function InterviewList({ interviews }: { interviews: InterviewSummary[] }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? interviews : interviews.slice(0, INITIAL);

  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium">
          Interviews <span className="ml-1 font-mono text-xs text-muted-foreground">{interviews.length}</span>
        </h2>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 sm:block">
          claims held up · verdict
        </span>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          Your interviews will appear here — each with its transcript and report.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {shown.map((iv) => (
              <Row key={iv.id} interview={iv} />
            ))}
          </ul>
          {interviews.length > INITIAL && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="w-full border-t border-border py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {showAll ? 'Show fewer' : `Show all ${interviews.length}`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
