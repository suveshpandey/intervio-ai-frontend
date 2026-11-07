'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hero figure: a resume after an Intervio interview, marked up in the margin.
 *
 * Shows the product's actual idea — each line is a claim, the interviewer
 * presses on it, and it comes back with a verdict — as an object people already
 * know (a printed CV with an editor's notes), not as a mock chat UI. Plays once
 * when it scrolls into view; under reduced motion it simply shows the end state.
 */

type Verdict = 'backed' | 'partly' | 'not';

interface Line {
  text: string;
  /** Present when the interviewer probed this line. */
  probe?: { asked: string; verdict: Verdict };
}

const ROLE_LINES: Line[] = [
  {
    text: 'Cut p95 latency on the reporting API from 820 ms to 190 ms with a composite index and a read-through cache.',
    probe: { asked: 'What was slow before the cache?', verdict: 'backed' },
  },
  { text: 'Migrated billing from a monolith to three services with zero downtime at cutover.' },
  {
    text: 'Designed a payments backend handling 100K requests a day.',
    probe: { asked: 'How was the 100K measured?', verdict: 'partly' },
  },
  {
    text: 'Led the move to an event-driven architecture across four teams.',
    probe: { asked: 'Which decisions were yours?', verdict: 'not' },
  },
];

/** The theme's own status colours, so the page reads as part of the product. */
const VERDICT: Record<Verdict, { label: string; ink: string }> = {
  backed: { label: 'backed up', ink: 'var(--success)' },
  partly: { label: 'partly', ink: 'var(--warning)' },
  not: { label: 'not shown', ink: 'var(--destructive)' },
};

/** Hand-drawn verdict marks — a tick, a wave, a cross — drawn in pen order. */
function Mark({ verdict, delay }: { verdict: Verdict; delay: number }) {
  const d =
    verdict === 'backed'
      ? 'M2.5 8.5 L6 12 L13.5 3.5'
      : verdict === 'partly'
        ? 'M2 9 C4 5.5, 6 5.5, 8 8 S12 10.5, 14 7'
        : 'M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5';
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden>
      <path
        d={d}
        fill="none"
        stroke={VERDICT[verdict].ink}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pen-stroke"
        style={{ animationDelay: `${delay}ms` }}
      />
    </svg>
  );
}

export function AnnotatedResume() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  // Play once, when it is actually on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setRun(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Each probed line gets its own beat: highlight, then the note, then the mark.
  let beat = 0;

  return (
    <figure ref={ref} data-run={run ? '' : undefined} className="annotated-resume relative">
      {/* The sheet uses the theme's own surfaces, with a hairline top edge like every other card. */}
      <div className="edge-top shadow-pop relative overflow-hidden rounded-xl border border-border bg-card text-foreground">
        {/* A faint ruled-paper texture: enough to read as a document, not a flat panel. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, color-mix(in oklab, var(--foreground) 4%, transparent) 27px, color-mix(in oklab, var(--foreground) 4%, transparent) 28px)',
          }}
        />

        <div className="relative px-7 pb-6 pt-7 sm:px-9 sm:pt-8">
          {/* Masthead */}
          <header
            className="flex items-end justify-between gap-4 border-b pb-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div>
              <p className="resume-serif text-[22px] leading-none tracking-[-0.01em]">Rahul Mehta</p>
              <p className="mt-1.5 text-[11px] tracking-wide text-muted-foreground">Backend Engineer · Bengaluru</p>
            </div>
            <p className="hidden text-right font-mono text-[10px] leading-relaxed text-muted-foreground/80 sm:block">
              rahul.mehta@mail.com
              <br />
              github.com/rmehta
            </p>
          </header>

          {/* Experience */}
          <section className="mt-5">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">Experience</p>
            <div className="mt-2.5 flex items-baseline justify-between gap-3">
              <p className="resume-serif text-[14px]">
                Zentrix Technologies <span className="text-muted-foreground">· Software Engineer</span>
              </p>
              <p className="shrink-0 font-mono text-[10px] text-muted-foreground/80">2023 – present</p>
            </div>

            <ul className="mt-2">
              {ROLE_LINES.map((line) => {
                const myBeat = line.probe ? beat++ : -1;
                const base = 350 + myBeat * 1050;
                return (
                  <li
                    key={line.text}
                    className="grid gap-x-5 gap-y-1 py-[5px] sm:grid-cols-[minmax(0,1fr)_9.5rem]"
                  >
                    <p className="resume-serif relative pl-3.5 text-[13px] leading-[1.6] text-foreground/85">
                      <span aria-hidden className="absolute left-0 top-[0.62em] h-[3px] w-[3px] rounded-full bg-muted-foreground/60" />
                      {line.probe ? (
                        <span className="marker" style={{ animationDelay: `${base}ms` }}>
                          {line.text}
                        </span>
                      ) : (
                        line.text
                      )}
                    </p>

                    {/* The interviewer's note, in the margin beside the line it's about. */}
                    {line.probe ? (
                      <div
                        className="margin-note border-l pl-3 sm:pt-0.5"
                        // The ruled margin where an editor writes — in the brand accent.
                        style={{
                          animationDelay: `${base + 450}ms`,
                          borderColor: 'color-mix(in oklab, var(--primary) 45%, transparent)',
                        }}
                      >
                        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground/70">asked</p>
                        <p className="resume-serif mt-0.5 text-[12px] italic leading-snug text-foreground/80">
                          {line.probe.asked}
                        </p>
                        <p
                          className="mt-1 flex items-center gap-1.5 text-[11px] font-medium"
                          style={{ color: VERDICT[line.probe.verdict].ink }}
                        >
                          <Mark verdict={line.probe.verdict} delay={base + 800} />
                          {VERDICT[line.probe.verdict].label}
                        </p>
                      </div>
                    ) : (
                      <span className="hidden sm:block" />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* The page carries on — fade it out rather than ending in a hard box. */}
          <section className="mt-4 opacity-70">
            <div className="flex items-baseline justify-between gap-3">
              <p className="resume-serif text-[14px]">
                Kalvi Labs <span className="text-muted-foreground">· Junior Developer</span>
              </p>
              <p className="shrink-0 font-mono text-[10px] text-muted-foreground/80">2021 – 2023</p>
            </div>
            <p className="resume-serif mt-2 pl-3.5 text-[13px] leading-[1.6] text-foreground/85">
              Rebuilt the student dashboard in React, cutting the initial bundle from 1.4 MB to 480 KB.
            </p>
          </section>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--card) 85%)' }}
        />
      </div>

      <figcaption className="mt-4 flex items-baseline justify-between gap-4 font-mono text-[11px] text-muted-foreground">
        <span>What came up in a 15-minute mock interview.</span>
        <span className="hidden shrink-0 text-muted-foreground/70 sm:inline">1 of 3 answers held up</span>
      </figcaption>
    </figure>
  );
}
