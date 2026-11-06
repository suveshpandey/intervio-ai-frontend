'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MicIcon, PhoneOffIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * The product, in one window: the resume Intervio reads, the report it writes, and the
 * live interview in between. Slides advance every 5 seconds with a progress bar on each
 * tab; hovering or focusing pauses it, and under reduced motion it never auto-advances.
 *
 * These are built from the app's own surfaces and copy, not screenshots, so they stay
 * sharp at any size and follow the theme.
 */

const DURATION_MS = 5000;

const SLIDES = [
  { key: 'resume', title: 'Your resume', note: 'We pick out what you claim' },
  { key: 'interview', title: 'The interview', note: 'A real conversation, out loud' },
  { key: 'report', title: 'Your report', note: 'Each claim, honestly weighed' },
] as const;

export function ProductShowcase() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const visible = useRef(true);
  const root = useRef<HTMLElement>(null);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // One clock per slide. Pausing freezes `elapsed` rather than restarting it, so hovering
  // mid-slide and leaving carries on from where it stopped.
  useEffect(() => {
    const bar = bars.current[index];
    if (reduced) {
      if (bar) bar.style.transform = 'scaleX(1)';
      return;
    }
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100); // a background tab must not skip ahead
      last = now;
      if (!paused.current && visible.current && !document.hidden) elapsed += dt;
      const p = Math.min(elapsed / DURATION_MS, 1);
      if (bar) bar.style.transform = `scaleX(${p})`;
      if (p >= 1) {
        setIndex((i) => (i + 1) % SLIDES.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, reduced]);

  const hold = (on: boolean) => () => {
    paused.current = on;
  };

  return (
    <figure
      ref={root}
      onPointerEnter={hold(true)}
      onPointerLeave={hold(false)}
      onFocus={hold(true)}
      onBlur={hold(false)}
      className="relative"
    >
      {/* The window */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_90px_-45px_rgba(10,42,74,0.5)]">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {[<ResumeSlide key="r" />, <InterviewSlide key="i" />, <ReportSlide key="a" />].map((slide, i) => (
              <div
                key={SLIDES[i].key}
                className="h-[470px] w-full shrink-0 overflow-hidden md:h-[540px]"
                aria-hidden={i !== index}
                inert={i !== index}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs, each with its own 5-second progress line */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-left sm:gap-5">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-current={i === index}
            className="group rounded-lg py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block h-[3px] overflow-hidden rounded-full bg-foreground/10">
              <span
                ref={(el) => {
                  bars.current[i] = el;
                }}
                className="block h-full origin-left rounded-full bg-primary"
                style={i === index ? undefined : { transform: 'scaleX(0)' }}
              />
            </span>
            <span
              className={cn(
                'mt-3 flex items-center gap-2 text-sm font-medium transition-colors',
                i === index ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              <span className="font-mono text-[11px] text-muted-foreground/70">0{i + 1}</span>
              {s.title}
            </span>
            <span className="mt-1 hidden text-xs leading-snug text-muted-foreground sm:block">{s.note}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}

/* ── Slide 1: a real resume, with the claims highlighted ── */

function Claim({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        backgroundImage:
          'linear-gradient(transparent 36%, color-mix(in oklab, var(--primary) 24%, transparent) 36%, color-mix(in oklab, var(--primary) 24%, transparent) 94%, transparent 94%)',
      }}
    >
      {children}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 mt-5 font-sans text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </p>
  );
}

function ResumeSlide() {
  return (
    // The desk, and the page on it — cut off at the bottom, because a real CV carries on.
    <div className="relative h-full overflow-hidden bg-muted px-4 pt-6 sm:px-8 sm:pt-8">
      <div className="resume-serif mx-auto h-[700px] max-w-[38rem] rounded-sm border border-border bg-card px-10 pb-10 pt-10 text-foreground shadow-[0_18px_40px_-22px_rgba(10,42,74,0.45)]">
        <header className="flex items-end justify-between gap-4 border-b border-border pb-3">
          <div>
            <p className="text-[26px] leading-none tracking-[-0.01em]">Rahul Mehta</p>
            <p className="mt-2 font-sans text-[11.5px] tracking-wide text-muted-foreground">
              Backend Engineer · Bengaluru, India
            </p>
          </div>
          <p className="hidden text-right font-mono text-[10px] leading-relaxed text-muted-foreground sm:block">
            rahul.mehta@mail.com
            <br />
            github.com/rmehta
          </p>
        </header>

        <Heading>Summary</Heading>
        <p className="text-[12.5px] leading-[1.65] text-foreground/85">
          Backend engineer with four years building payments and reporting systems in Go and
          PostgreSQL. Comfortable owning a service from schema to on-call.
        </p>

        <Heading>Experience</Heading>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13.5px]">
            Zentrix Technologies <span className="text-muted-foreground">· Software Engineer</span>
          </p>
          <p className="shrink-0 font-mono text-[10px] text-muted-foreground">2023 – present</p>
        </div>
        <ul className="mt-2.5 list-disc space-y-2 pl-5 text-[12.5px] leading-[1.65] text-foreground/85 marker:text-muted-foreground/60">
          <li>
            <Claim>
              Cut p95 latency on the reporting API from 820 ms to 190 ms with a composite index and a
              read-through cache.
            </Claim>
          </li>
          <li>
            <Claim>Migrated billing from a monolith to three services with zero downtime.</Claim>
          </li>
          <li>
            <Claim>Designed a payments backend handling 100K requests a day.</Claim>
          </li>
          <li>
            <Claim>Led the move to an event-driven architecture across four teams.</Claim>
          </li>
        </ul>

        <div className="mt-5 flex items-baseline justify-between gap-3">
          <p className="text-[13.5px]">
            Kalvi Labs <span className="text-muted-foreground">· Junior Developer</span>
          </p>
          <p className="shrink-0 font-mono text-[10px] text-muted-foreground">2021 – 2023</p>
        </div>
        <ul className="mt-2.5 list-disc pl-5 text-[12.5px] leading-[1.65] text-foreground/85 marker:text-muted-foreground/60">
          <li>
            <Claim>
              Rebuilt the student dashboard in React, cutting the initial bundle from 1.4 MB to 480 KB.
            </Claim>
          </li>
        </ul>

        <Heading>Education</Heading>
        <p className="text-[13.5px]">
          B.Tech, Computer Science <span className="text-muted-foreground">· 2017 – 2021</span>
        </p>
      </div>
    </div>
  );
}

/* ── Slide 2: the interview room — just the two of you ── */

function InterviewSlide() {
  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Image src="/logo.png" alt="" width={22} height={22} />
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">
            Intervio<span className="text-muted-foreground">.ai</span>
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
          <span className="truncate text-sm text-muted-foreground">Backend Engineer interview</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-[var(--hangup)]" aria-hidden />
          <span className="font-mono text-xs tabular-nums text-foreground/85">9:42 left</span>
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center gap-6 px-4 py-6 sm:px-8">
        <div className="grid w-full max-w-3xl flex-1 gap-4 sm:grid-cols-2">
          <Tile name="Priya" subtitle="Interviewer" initials="PR" ai active status="Speaking" bars />
          <Tile name="You" subtitle="Rahul" initials="RM" status="Listening" />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 p-2 shadow-pop">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-surface text-foreground">
            <MicIcon className="h-5 w-5" />
          </span>
          <span className="flex h-11 items-center gap-2 rounded-full bg-[var(--hangup)] px-5 text-sm font-medium text-white">
            <PhoneOffIcon className="h-5 w-5" />
            End
          </span>
        </div>
      </div>
    </div>
  );
}

function Tile({
  name,
  subtitle,
  initials,
  ai,
  active,
  status,
  bars,
}: {
  name: string;
  subtitle: string;
  initials: string;
  ai?: boolean;
  active?: boolean;
  status: string;
  bars?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[150px] items-center justify-center overflow-hidden rounded-2xl border bg-card',
        active ? 'border-primary/70 shadow-[0_0_0_1px_var(--primary)]' : 'border-border',
      )}
    >
      <div className="relative grid place-items-center">
        {ai &&
          [0, 600, 1200].map((delay) => (
            <span
              key={delay}
              aria-hidden
              className="voice-ripple absolute inset-0 rounded-full border border-primary/40"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        <div
          className={cn(
            'relative grid h-24 w-24 place-items-center rounded-full text-3xl font-semibold sm:h-28 sm:w-28',
            ai ? 'bg-primary/12 text-primary ring-1 ring-primary/25' : 'bg-surface text-foreground/85 ring-1 ring-border',
          )}
        >
          {initials}
        </div>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-background/65 px-2.5 py-1.5 backdrop-blur-md">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <div
        className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md',
          ai ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-background/60 text-muted-foreground',
        )}
      >
        {bars && (
          <span className="flex h-2.5 items-center gap-[2px]" aria-hidden>
            {[0, 120, 240].map((d) => (
              <span key={d} className="eq-bar h-2.5 w-[2px] rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        )}
        {status}
      </div>
    </div>
  );
}

/* ── Slide 3: the report — a verdict, the claims, the scores ── */

const AUDIT = [
  { label: 'Cut API latency from 820 to 190 ms', tone: 'success' as const, text: 'Backed up', dot: 'bg-success' },
  { label: 'Payments backend at 100K requests a day', tone: 'warning' as const, text: 'Partly backed up', dot: 'bg-warning' },
  { label: 'Led the move to event-driven architecture', tone: 'destructive' as const, text: 'Not enough detail', dot: 'bg-destructive' },
];

const SCORES = [
  { label: 'Depth', score: 6.8, color: 'bg-success' },
  { label: 'Specifics', score: 5.4, color: 'bg-warning' },
  { label: 'Clarity', score: 7.6, color: 'bg-success' },
];

function ReportSlide() {
  return (
    <div className="flex h-full flex-col gap-4 bg-background p-5 sm:p-7">
      <div className="grid grid-cols-3 gap-3">
        <Summary label="Result" value="Almost there" valueClass="text-warning" />
        <Summary label="Claims backed up" value="1 of 3" />
        <Summary label="Questions answered" value="9" />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="flex flex-col rounded-2xl border border-border bg-card">
          <h3 className="border-b border-border px-5 py-3.5 text-sm font-semibold tracking-tight">Your claims</h3>
          <ul className="flex flex-1 flex-col divide-y divide-border">
            {AUDIT.map((c) => (
              <li key={c.label} className="flex flex-1 items-center gap-3 px-5 py-3">
                <span aria-hidden className={cn('h-2 w-2 shrink-0 rounded-full', c.dot)} />
                <span className="min-w-0 flex-1 text-sm leading-snug">{c.label}</span>
                <Badge tone={c.tone}>{c.text}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="hidden flex-col rounded-2xl border border-border bg-card md:flex">
          <h3 className="border-b border-border px-5 py-3.5 text-sm font-semibold tracking-tight">How you answered</h3>
          <dl className="flex flex-1 flex-col justify-around px-5 py-4">
            {SCORES.map((d) => (
              <div key={d.label}>
                <div className="flex items-baseline justify-between">
                  <dt className="text-sm font-medium">{d.label}</dt>
                  <dd className="font-mono text-sm tabular-nums">{d.score.toFixed(1)}</dd>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
                  <div className={cn('h-full rounded-full', d.color)} style={{ width: `${d.score * 10}%` }} />
                </div>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </div>
  );
}

function Summary({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3.5 sm:px-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-xl font-semibold tracking-tight sm:text-2xl', valueClass)}>{value}</p>
    </div>
  );
}
