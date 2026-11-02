'use client';

import { useState } from 'react';
import { VERDICT, formatDay } from '@/components/dashboard/verdict';
import type { InterviewSummary } from '@/lib/contracts';

/** How many past interviews the history shows. */
const HISTORY = 8;

/**
 * "Where you stand": the one number the product exists for — your latest verdict
 * — plus how your recent interviews compare, so progress is visible at a glance.
 */
export function StandingCard({ interviews }: { interviews: InterviewSummary[] }) {
  // Newest first from the API; only interviews that produced a report count.
  const reported = interviews.filter((i) => i.verdict && i.claims);
  const latest = reported[0];
  const history = reported.slice(0, HISTORY).reverse(); // oldest → newest, left → right
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="edge-top relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Where you stand</p>

      {!latest ? (
        <div className="flex flex-1 flex-col justify-center py-8">
          <p className="text-lg font-medium tracking-tight">No verdict yet</p>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Your readiness shows up here after your first interview — and how it changes over the next
            ones.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid flex-1 content-center gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="flex items-center gap-2.5 text-3xl font-semibold tracking-tight">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: VERDICT[latest.verdict!].color }}
              />
              {VERDICT[latest.verdict!].label}
            </p>
            <p className="mt-2.5 text-sm">
              <span className="text-foreground">
                {latest.claims!.claimsSupported} of {latest.claims!.claimsProbed}
              </span>{' '}
              <span className="text-muted-foreground">claims backed up in your last interview</span>
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">
              {latest.role} · {formatDay(latest.createdAt)}
            </p>
          </div>

          {/* Recent interviews: how much of each held up. One series — the title names it. */}
          <div className="sm:w-48">
            <div className="relative flex h-16 items-end justify-end gap-1.5" onMouseLeave={() => setHovered(null)}>
              {history.map((iv, i) => {
                const ratio = iv.claims!.claimsProbed ? iv.claims!.claimsSupported / iv.claims!.claimsProbed : 0;
                return (
                  <button
                    key={iv.id}
                    type="button"
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    aria-label={`${formatDay(iv.createdAt)}: ${VERDICT[iv.verdict!].label}, ${iv.claims!.claimsSupported} of ${iv.claims!.claimsProbed}`}
                    className="flex h-full w-3 items-end"
                  >
                    <span
                      className="w-full rounded-t-[3px] transition-opacity"
                      style={{
                        // A sliver even at zero, so "nothing held up" still reads as an interview.
                        height: `${Math.max(8, ratio * 100)}%`,
                        background: VERDICT[iv.verdict!].color,
                        opacity: hovered === null || hovered === i ? 0.85 : 0.3,
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground/80">
              {hovered !== null && history[hovered] ? (
                <span className="text-foreground/85">
                  {formatDay(history[hovered].createdAt)} · {history[hovered].claims!.claimsSupported}/
                  {history[hovered].claims!.claimsProbed} held up
                </span>
              ) : (
                <>
                  <span>{history.length > 1 ? `Last ${history.length} interviews` : 'Your first interview'}</span>
                  <span>claims held up</span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
