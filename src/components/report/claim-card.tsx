'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ClaimAuditEntry, ClaimBand } from '@/lib/contracts';

/**
 * PRD safe language: a claim is never "false", only more or less backed up by
 * what was actually said. `not_covered` is deliberately neutral — the interview
 * ran out of time, which is not the candidate's failure.
 */
const BANDS: Record<ClaimBand, { label: string; tone: 'success' | 'warning' | 'destructive' | 'muted'; blurb: string }> =
  {
    supported: { label: 'Backed up', tone: 'success', blurb: 'You explained this with real specifics.' },
    partial: { label: 'Partly backed up', tone: 'warning', blurb: 'Some detail landed, some was missing.' },
    insufficient: {
      label: 'Not enough detail',
      tone: 'destructive',
      blurb: "Your answers didn't yet show what you personally did here.",
    },
    not_covered: { label: 'Not covered', tone: 'muted', blurb: 'The interview ended before this came up.' },
  };

export function ClaimCard({ claim }: { claim: ClaimAuditEntry }) {
  const [open, setOpen] = useState(false);
  const band = BANDS[claim.band];
  const hasDetail = claim.evidence.length > 0;

  return (
    <article className="rounded-2xl border border-border bg-card">
      <div className="flex items-start gap-3 p-4 sm:p-5">
        <span
          aria-hidden
          className={cn(
            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
            claim.band === 'supported' && 'bg-success',
            claim.band === 'partial' && 'bg-warning',
            claim.band === 'insufficient' && 'bg-destructive',
            claim.band === 'not_covered' && 'bg-muted-foreground/50',
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] leading-relaxed">{claim.text}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <Badge tone={band.tone}>{band.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {claim.band === 'not_covered'
                ? band.blurb
                : `${band.blurb} · ${claim.turnsSpent} question${claim.turnsSpent === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>
      </div>

      {hasDetail && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex w-full items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:px-5"
          >
            {open ? 'Hide what you said' : 'See what you said'}
            <ChevronDownIcon className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
          </button>

          {open && (
            <div className="space-y-3 border-t border-border px-4 py-4 sm:px-5">
              {claim.evidence.map((ev, i) => (
                <div key={i} className="rounded-xl bg-surface p-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={ev.polarity === 'support' ? 'success' : 'destructive'}>
                      {ev.polarity === 'support' ? 'In your favour' : 'Raised doubt'}
                    </Badge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      question {ev.turnIdx + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{ev.rationale}</p>
                  {ev.quote && (
                    <p className="mt-2 border-l-2 border-border pl-3 text-sm italic leading-relaxed text-foreground/80">
                      &ldquo;{ev.quote}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  );
}
