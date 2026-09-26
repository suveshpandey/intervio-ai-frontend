'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * "Pick a line, see what happens to it."
 *
 * The product's whole idea is that a resume line is a claim someone has to
 * defend. Telling a visitor that is abstract; letting them click three real
 * lines and read the question, the answer and the verdict is not. Canned
 * examples, clearly framed as such.
 */

type Band = 'supported' | 'partial' | 'insufficient';

interface Example {
  claim: string;
  question: string;
  answer: string;
  band: Band;
  verdict: string;
}

const BANDS: Record<Band, { label: string; tone: string; dot: string; bar: string; width: string }> = {
  supported: {
    label: 'Backed up',
    tone: 'border-success/30 bg-success/10 text-success',
    dot: 'bg-success',
    bar: 'bg-success',
    width: '88%',
  },
  partial: {
    label: 'Partly backed up',
    tone: 'border-warning/30 bg-warning/10 text-warning',
    dot: 'bg-warning',
    bar: 'bg-warning',
    width: '58%',
  },
  insufficient: {
    label: 'Not enough detail',
    tone: 'border-destructive/30 bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
    bar: 'bg-destructive',
    width: '24%',
  },
};

const EXAMPLES: Example[] = [
  {
    claim: 'Cut p95 API latency from 820ms to 190ms',
    question: 'What was actually slow before you added the cache — had you profiled it?',
    answer:
      'The dashboard endpoint joined four tables and the transactions timestamp had no index, so it did a full scan. I added a composite index first, which took it to about 300ms, then cached the aggregate for five minutes.',
    band: 'supported',
    verdict: 'Named the real bottleneck, the fix, and the order they did it in.',
  },
  {
    claim: 'Backend handling 100K requests a day',
    question: 'How did you measure that peak, and what broke first?',
    answer: 'We added a Redis cache and it got much faster. I think we were around 100K on a busy day.',
    band: 'partial',
    verdict: 'The caching work is real. The number itself was never measured.',
  },
  {
    claim: 'Led the migration to an event-driven architecture',
    question: 'What did you own on that migration, and who decided the event schema?',
    answer: 'I was part of the team that worked on it. The architect set most of it up.',
    band: 'insufficient',
    verdict: 'Nothing here shows what they personally decided or built.',
  },
];

export function ClaimExplorer() {
  const [active, setActive] = useState(0);
  const example = EXAMPLES[active]!;
  const band = BANDS[example.band];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* the resume lines */}
      <div className="border-b border-border p-2">
        <p className="px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
          Pick a line from a resume
        </p>
        <div className="flex flex-col gap-1">
          {EXAMPLES.map((item, i) => (
            <button
              key={item.claim}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                i === active
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                  i === active ? BANDS[item.band].dot : 'bg-muted-foreground/30',
                )}
              />
              {item.claim}
            </button>
          ))}
        </div>
      </div>

      {/* what the interview does with it — keyed so it re-animates per claim */}
      <div key={active} className="rise space-y-4 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-primary/70">It asks</p>
          <p className="mt-1.5 text-[15px] leading-relaxed">{example.question}</p>
        </div>

        <div className="border-l-2 border-border pl-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">You answer</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{example.answer}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Verdict
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                band.tone,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', band.dot)} />
              {band.label}
            </span>
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
            <div
              className={cn('h-full rounded-full transition-all duration-500', band.bar)}
              style={{ width: band.width }}
            />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{example.verdict}</p>
        </div>
      </div>
    </div>
  );
}
