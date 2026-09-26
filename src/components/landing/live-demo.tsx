'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The hero's centrepiece: a scripted interview that plays itself.
 *
 * A screenshot can't show what makes this product different — that the
 * interviewer picks a line off your resume, presses on it, and ends with a
 * verdict tied to what you said. So the mock runs the loop instead of describing
 * it. Entirely canned; no network, no audio.
 */

interface Beat {
  /** How long this beat holds before the next one, in ms. */
  hold: number;
}

type Phase = 'asking' | 'listening' | 'answering' | 'thinking' | 'verdict';

const QUESTION =
  'You wrote that you built a Node backend handling 100K requests a day. How did you measure that peak, and what broke first?';
const ANSWER =
  'We added a Redis read-through cache and it got much faster. I think we were around 100K on a busy day.';

const BEATS: Record<Phase, Beat> = {
  asking: { hold: 2600 },
  listening: { hold: 900 },
  answering: { hold: 3200 },
  thinking: { hold: 1500 },
  verdict: { hold: 5200 },
};

const ORDER: Phase[] = ['asking', 'listening', 'answering', 'thinking', 'verdict'];

/** Types text out at a readable pace; jumps to the end when motion is reduced. */
function useTypewriter(text: string, active: boolean, durationMs: number, reduced: boolean) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    if (!active) {
      setShown('');
      return;
    }
    if (reduced) {
      setShown(text);
      return;
    }
    const step = Math.max(12, durationMs / text.length);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [text, active, durationMs, reduced]);

  return shown;
}

export function LiveDemo() {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const phase = ORDER[index]!;

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Don't animate off-screen: it's wasted work and a distraction in a background tab.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry?.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % ORDER.length), BEATS[phase].hold);
    return () => clearTimeout(id);
  }, [index, phase, paused]);

  const question = useTypewriter(QUESTION, ORDER.indexOf(phase) >= 0, 1800, reduced);
  const answer = useTypewriter(ANSWER, phase === 'answering', 2200, reduced);

  const showAnswer = phase === 'answering' || phase === 'thinking' || phase === 'verdict';
  const showVerdict = phase === 'verdict';

  return (
    <div ref={rootRef} className="relative">
      <div className="edge-top shadow-pop overflow-hidden rounded-2xl border border-border bg-card">
        {/* window bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium">Live interview</span>
          <span className="ml-auto font-mono text-xs text-muted-foreground">Claim verification</span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">12:47</span>
        </div>

        {/* transcript — fixed height so the card never jumps as beats change */}
        <div className="flex min-h-[248px] flex-col gap-4 px-4 py-5 sm:px-5">
          <div className="flex gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-[11px] font-semibold text-primary">
              M
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-foreground/90">
              {question}
              {question.length < QUESTION.length && (
                <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-primary" />
              )}
            </div>
          </div>

          {showAnswer && (
            <div className="flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-tr-sm border border-border bg-background px-3.5 py-2.5 text-sm leading-relaxed text-muted-foreground">
                {reduced ? ANSWER : answer || '…'}
              </div>
            </div>
          )}

          {/* One status line, so the card has a heartbeat between the bubbles. */}
          <div className="mt-auto flex items-center gap-3 pl-10">
            {phase === 'listening' || phase === 'answering' ? (
              <>
                <div className="flex items-end gap-0.5" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <span
                      key={i}
                      className="eq-bar w-0.5 rounded-full bg-primary/70"
                      style={{ height: 14, animationDelay: `${i * 0.11}s` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs text-muted-foreground">listening…</span>
              </>
            ) : phase === 'thinking' ? (
              <span className="font-mono text-xs text-muted-foreground">
                weighing that against the claim<span className="thinking-dots" />
              </span>
            ) : null}
          </div>
        </div>

        {/* the verdict — the point of the whole thing */}
        <div
          className={cn(
            'grid border-t border-border transition-all duration-500',
            showVerdict ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 py-4 sm:px-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Claim audit
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  Partly backed up
                </span>
              </div>
              <p className="text-sm text-foreground/80">
                &ldquo;100K requests/day backend&rdquo;
                <span className="text-muted-foreground">
                  {' '}
                  — the caching work landed, but the peak number itself went unmeasured.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* floating readiness chip */}
      <div className="animate-float shadow-float absolute -bottom-6 -left-4 hidden rounded-xl border border-border bg-surface px-4 py-3 sm:block">
        <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Readiness
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-xl font-semibold tabular-nums text-primary">7.4</span>
          <span className="text-xs text-muted-foreground">/ 10</span>
        </div>
      </div>
    </div>
  );
}
