import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AnnotatedResume } from '@/components/landing/annotated-resume';
import { ClaimExplorer } from '@/components/landing/claim-explorer';
import { VoicePreview } from '@/components/landing/voice-preview';
import { Reveal } from '@/components/landing/reveal';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeatureCards } from '@/components/landing/feature-cards';

/* ------------------------------------------------------------------ */
/* Icons (inline, stroke 1.5 — no icon dependency)                     */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };







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



/* ------------------------------------------------------------------ */
/* Hero product mockup — a live interview session card                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */




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
            AI mock interviews for developers
          </span>

          <h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl">
            <span className="text-gradient">A real interview,</span>
            <br />
            <span className="text-primary">before the real one.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Talk to an AI interviewer out loud, right in your browser. It asks about the work
            you&apos;ve actually done, follows up when an answer is thin, and tells you exactly how
            ready you are.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/signup">
              <Button className="h-11 px-5 text-[15px]">
                Start a mock interview
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
              <span className="h-1 w-1 rounded-full bg-primary" /> Spoken, not typed
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> Real follow-up questions
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-primary" /> Built for devs 0–6 yrs
            </span>
          </div>
        </div>

        <div className="lg:pl-4">
          <AnnotatedResume />
        </div>
      </section>

      {/* how it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            From upload to a real interview in minutes.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Your resume sets the questions. The interview is where you find out how you&apos;d really
            do.
          </p>
        </div>

        <HowItWorks />
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
              Most mock interviews ask generic questions.{' '}
              <span className="text-primary">Ours asks about you.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Practice tools quiz you on textbook questions anyone can look up. A real interviewer
              picks a line from your resume and says &ldquo;walk me through that.&rdquo; That&apos;s the
              interview Intervio runs — and its feedback is built on what you actually said, not how
              smooth you sounded.
            </p>
            <p className="mt-4 text-muted-foreground">
              Fair feedback, never accusations. Each answer is judged{' '}
              <span className="text-foreground">backed up</span>,{' '}
              <span className="text-foreground">partly backed up</span>, or{' '}
              <span className="text-foreground">not enough detail</span> — with the exact moment in
              the interview that decided it.
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
            Built to feel like the real interview.
          </h2>
        </div>

        <FeatureCards />
      </section>

      {/* final CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        {/*
          The one loud surface on the page: a gradient in the brand accent, so it
          inverts with the theme — blue on slate in dark mode, navy with white
          text in light mode.
        */}
        <div
          className="relative overflow-hidden rounded-3xl px-6 py-16 text-center text-primary-foreground sm:py-20"
          style={{
            background:
              'linear-gradient(135deg, var(--cta-a) 0%, var(--cta-b) 52%, var(--cta-c) 100%)',
          }}
        >
          {/* Soft light from the top, so the colour has depth. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 80% at 50% 0%, color-mix(in oklab, white 16%, transparent), transparent 70%)',
            }}
          />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Walk into your next interview already prepared.
            </h2>
            <p className="mx-auto mt-4 max-w-lg opacity-80">
              Upload your resume, take a 15-minute mock interview out loud, and get an honest report on
              how ready you are.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-background px-6 text-[15px] font-medium text-foreground shadow-pop transition-transform hover:-translate-y-0.5"
              >
                Start a mock interview
                <IconArrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Brand compact />
            <span className="ml-1 text-sm text-muted-foreground">Practise the interview, not just the resume.</span>
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
