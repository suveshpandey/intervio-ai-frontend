import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LiveDemo } from '@/components/landing/live-demo';
import { ClaimExplorer } from '@/components/landing/claim-explorer';
import { VoicePreview } from '@/components/landing/voice-preview';
import { Reveal } from '@/components/landing/reveal';

/* ------------------------------------------------------------------ */
/* Icons (inline, stroke 1.5 — no icon dependency)                     */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

function IconFile({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M14 3v4a1 1 0 0 0 1 1h4M15 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-4-5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMic({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 11a7 7 0 0 1-14 0M12 18v3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconReport({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 19V5M4 19h16M8 16v-4M12 16V8M16 16v-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconShield({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.5 12 1.8 1.8L15 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBolt({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function IconArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function Brand({ compact = false }: { compact?: boolean }) {
  const size = compact ? 24 : 32;
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="Intervio" width={size} height={size} priority />
      <span className="text-[15px] font-semibold tracking-tight">
        Intervio<span className="text-muted-foreground">.ai</span>
      </span>
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-7 bg-primary/50" />
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{children}</span>
    </div>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-primary">
      {children}
    </span>
  );
}


/* ------------------------------------------------------------------ */
/* Hero product mockup — a live interview session card                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    n: '01',
    icon: IconFile,
    title: 'Upload resume + JD',
    body: 'Drop in a PDF or DOCX and the job description. Intervio extracts your skills, projects, and the specific claims worth defending.',
  },
  {
    n: '02',
    icon: IconMic,
    title: 'Live voice interview',
    body: 'A real spoken interview in your browser. It adapts in real time — probing vague answers, moving on when you’re solid, digging where it matters.',
  },
  {
    n: '03',
    icon: IconReport,
    title: 'Honest readiness report',
    body: 'Skill scores, a claim-by-claim audit backed by what you actually said, a readiness verdict, and the exact things to fix.',
  },
];

const FEATURES = [
  {
    icon: IconTarget,
    title: 'Claim verification',
    body: 'Every line on your resume becomes a claim that needs evidence. We probe it, weigh what you say, and grade it supported, partial, or insufficient — with a confidence number.',
  },
  {
    icon: IconBolt,
    title: 'Adaptive interview engine',
    body: 'A deterministic engine runs the interview — respecting time budgets, never repeating, easing off after two weak answers. The AI only evaluates and asks. Reliable, not a rambling chatbot.',
  },
  {
    icon: IconMic,
    title: 'Voice, in the browser',
    body: 'Low-latency streaming speech in and out — no phone, no downloads, no setup. Live captions on both sides so you can follow every word.',
  },
  {
    icon: IconShield,
    title: 'Honest, defensible scoring',
    body: 'Scores come from evidence your code computes, not a vibe. Every verdict cites the moment in the interview that earned it — no “lie detection,” just evidence.',
  },
];


/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      {/* ambient background — one restrained aura + a faint blueprint grid */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 -z-20"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 55% at 50% 0%, #000 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 55% at 50% 0%, #000 30%, transparent 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
        style={{
          background:
            'radial-gradient(46% 60% at 62% -8%, rgba(169,211,255,0.14), transparent 72%)',
        }}
      />

      {/* nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-9">
            <Brand />
            <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              <a href="#how" className="nav-link transition-colors hover:text-foreground">
                How it works
              </a>
              <a href="#why" className="nav-link transition-colors hover:text-foreground">
                Why it&apos;s different
              </a>
              <a href="#features" className="nav-link transition-colors hover:text-foreground">
                Features
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="h-9 px-3">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-9 px-4">Get started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Voice interviews for developers
          </span>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            <span className="text-gradient">Go beyond</span>
            <br />
            <span className="text-primary">the resume.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Intervio is a browser voice interviewer that checks whether you can actually defend
            what&apos;s on your resume — then tells you how ready you are and exactly what to work
            on.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button className="h-11 px-5 text-[15px]">
                Start your interview
                <IconArrow className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="h-11 px-5 text-[15px]">
                Log in
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> Browser-only, no phone
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> Adaptive, claim-probing
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> Built for devs 0–6 yrs
            </span>
          </div>
        </div>

        <div className="lg:pl-4">
          <LiveDemo />
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            One loop, end to end.
          </h2>
          <p className="mt-4 text-muted-foreground">
            From resume to readiness in a single session — no busywork, no generic question banks.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }, i) => (
            <Reveal key={n} delay={i * 90} className="bg-card p-7">
              <div className="flex items-center justify-between">
                <IconTile>
                  <Icon className="h-5 w-5" />
                </IconTile>
                <span className="font-mono text-2xl font-semibold text-muted-foreground/25">
                  {n}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* hear it */}
      <section className="mx-auto max-w-6xl px-5 pb-4">
        <Reveal>
          <div className="edge-top rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-md">
                <Eyebrow>Your interviewer</Eyebrow>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight">Hear who you&apos;ll be talking to.</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Three voices to choose from before you start. Press play — this is the real thing,
                  not a description of it.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <VoicePreview />
            </div>
          </div>
        </Reveal>
      </section>

      {/* why it's different */}
      <section id="why" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Why it&apos;s different</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Everyone else scores answers. We audit your{' '}
              <span className="text-primary">claims.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Intervio turns your resume into a set of claims that need evidence, then spends the
              interview finding out which ones you can actually back up. The report is built around
              what you proved — not how smooth you sounded.
            </p>
            <p className="mt-4 text-muted-foreground">
              Safe language, always. Verdicts are{' '}
              <span className="text-foreground">supported</span>,{' '}
              <span className="text-foreground">partial</span>, or{' '}
              <span className="text-foreground">insufficient evidence</span> — each with a
              confidence number and the exact moment that earned it.
            </p>
          </div>

          <ClaimExplorer />
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow>Features</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built to be honest, fast, and hard to fool.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 80} className="bg-card p-7">
              <IconTile>
                <Icon className="h-5 w-5" />
              </IconTile>
              <h3 className="mt-6 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="edge-top relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:py-20">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(55% 120% at 50% 0%, rgba(169,211,255,0.12), transparent 70%)',
            }}
          />
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Find out how ready you really are.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Upload your resume, talk it through, and get an honest read on your readiness in one
            sitting.
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/signup">
              <Button className="h-11 px-6 text-[15px]">
                Get started free
                <IconArrow className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Brand compact />
            <span className="ml-1 text-sm text-muted-foreground">Go beyond the resume.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/login" className="transition-colors hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
