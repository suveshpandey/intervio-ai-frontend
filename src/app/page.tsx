import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ForceLight } from '@/components/force-light';
import { HeroParticles } from '@/components/landing/hero-particles';
import { TypedHeadline } from '@/components/landing/typed-headline';
import { ProductShowcase } from '@/components/landing/product-showcase';
import { ClaimExplorer } from '@/components/landing/claim-explorer';
import { VoicePreview } from '@/components/landing/voice-preview';
import { SplitSection } from '@/components/landing/split-section';
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
      <Image
        src="/logo.png"
        alt="Intervio"
        width={size}
        height={size}
        priority
      />
      <span className="text-[15px] font-semibold tracking-tight">
        Intervio<span className="text-muted-foreground">.ai</span>
      </span>
    </Link>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
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

const HERO_PHRASES = [
  'before the real one.',
  'about your real work.',
  'out loud, not typed.',
  'that follows up.',
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <ForceLight />
      {/* ambient background — one restrained aura + a faint blueprint grid */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 -z-20"
        style={{
          maskImage:
            'radial-gradient(ellipse 90% 55% at 50% 0%, #000 30%, transparent 100%)',
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

      {/* nav — a floating pill, not a full-width bar */}
      <header className="sticky top-3 z-50 px-4">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border border-foreground/10 bg-background/70 pl-5 pr-2 shadow-float backdrop-blur-xl">
          <div className="flex items-center gap-9">
            <Brand />
            <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              <a
                href="#how"
                className="nav-link transition-colors hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#why"
                className="nav-link transition-colors hover:text-foreground"
              >
                Why it&apos;s different
              </a>
              <a
                href="#features"
                className="nav-link transition-colors hover:text-foreground"
              >
                Features
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href="/login">
              <Button variant="ghost" className="h-9 rounded-full px-4">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-10 rounded-full px-5">Get started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24 text-center lg:pb-32">
        {/* drifting particles, dissolving toward the bottom */}
        <HeroParticles className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[100dvh] min-h-[640px] w-full" />

        {/* the hero fills the first screen, with its content centred like a poster */}
        <div className="flex min-h-[100dvh] flex-col items-center justify-center pb-10 pt-24">

        <h1 className="mx-auto max-w-4xl text-balance text-6xl font-normal leading-[1.02] tracking-[-0.045em] sm:text-8xl lg:text-[7rem]">
          <span className="text-gradient">A real interview,</span>
          <br />
          <span className="text-primary">
            <TypedHeadline phrases={HERO_PHRASES} />
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-2xl">
          Talk to an AI interviewer out loud, right in your browser. It asks
          about the work you&apos;ve actually done, follows up when an answer is
          thin, and tells you exactly how ready you are.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup">
            <Button className="h-12 rounded-full px-7 text-[15px]">
              Start a mock interview
              <IconArrow className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="h-12 rounded-full px-7 text-[15px]"
            >
              Log in
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" /> Spoken, not
            typed
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" /> Real follow-up
            questions
          </span>
          <span className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-primary" /> Built for devs
            0–6 yrs
          </span>
        </div>

        </div>

        {/* the product: resume → interview → analysis, sliding every 5s */}
        <div className="mx-auto max-w-6xl text-left">
          <ProductShowcase />
        </div>
      </section>

      {/* how it works */}
      <SplitSection
        id="how"
        title="From upload to a real interview in minutes."
        body="Your resume sets the questions. The interview is where you find out how you'd really do."
        action={
          <Link href="/signup">
            <Button variant="outline" className="h-11 rounded-full px-6">
              Try it free
            </Button>
          </Link>
        }
      >
        <HowItWorks />
      </SplitSection>

      {/* hear it */}
      <SplitSection
        flip
        title="Hear who you'll be talking to."
        body="Three voices to choose from before you start. Press play: this is the real thing, not a description of it."
      >
        <VoicePreview />
      </SplitSection>

      {/* why it's different */}
      <SplitSection
        id="why"
        title={
          <>
            Most mock interviews ask generic questions.{' '}
            <span className="text-primary">Ours asks about you.</span>
          </>
        }
        body={
          <>
            A real interviewer picks a line from your resume and says
            &ldquo;walk me through that.&rdquo; Each answer is judged{' '}
            <span className="text-foreground">backed up</span>,{' '}
            <span className="text-foreground">partly backed up</span>, or{' '}
            <span className="text-foreground">not enough detail</span>, with the
            exact moment that decided it.
          </>
        }
      >
        <ClaimExplorer />
      </SplitSection>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
        <div className="grid items-end gap-4 lg:grid-cols-2 lg:gap-16">
          <h2 className="text-4xl font-normal leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            Built to feel like the real interview.
          </h2>
          <p className="text-muted-foreground">
            Spoken questions, live follow-ups and a report you can act on.
          </p>
        </div>

        <FeatureCards />
      </section>

      {/* footer: links up top, the name set huge, a quiet bar underneath */}
      <footer className="overflow-hidden border-t border-border">
        <div className="mx-auto max-w-6xl px-5">
          <div className="grid gap-12 pb-4 pt-16 sm:grid-cols-2 sm:pt-20">
            <p className="max-w-xs text-2xl font-medium leading-snug tracking-tight">
              You said it.
              <br />
              <span className="text-muted-foreground">Now prove it.</span>
            </p>

            <div className="grid grid-cols-2 gap-8 text-sm sm:justify-items-end">
              <FooterColumn
                title="Product"
                links={[
                  { href: '#how', label: 'How it works' },
                  { href: '#why', label: 'Why Intervio' },
                  { href: '#features', label: 'Features' },
                ]}
              />
              <FooterColumn
                title="Account"
                links={[
                  { href: '/login', label: 'Log in' },
                  { href: '/signup', label: 'Sign up' },
                  { href: '/forgot-password', label: 'Reset password' },
                ]}
              />
            </div>
          </div>

          {/* The wordmark spans the page, like the sites that sign off with their name. */}
          <p
            aria-hidden
            className="select-none whitespace-nowrap pb-8 pt-10 text-center font-semibold leading-[0.85] tracking-[-0.04em] text-foreground sm:pt-14"
            style={{ fontSize: 'clamp(3.5rem, 29vw, 23rem)' }}
          >
            Intervio
          </p>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
            <Brand compact />
            <p>
              © {new Date().getFullYear()} Intervio. Practise the interview, not
              just the resume.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
