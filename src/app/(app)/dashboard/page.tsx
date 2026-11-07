'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/app/page-header';
import { ArrowRightIcon } from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import { useInterviews } from '@/lib/interviews';
import { useLastResume, type LastResume } from '@/lib/last-resume';
import { GettingStarted } from '@/components/app/getting-started';
import { StandingCard } from '@/components/dashboard/standing-card';
import { NextStep } from '@/components/dashboard/next-step';
import { InterviewList } from '@/components/dashboard/interview-list';
import { ResumeShelf } from '@/components/dashboard/resume-shelf';

export default function DashboardPage() {
  const { user } = useSession();
  const resumes = useResumes();
  const interviews = useInterviews();
  const items = resumes.data?.resumes ?? [];
  const runs = interviews.data?.interviews ?? [];
  const last = useLastResume();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const loading = resumes.isLoading || interviews.isLoading;
  const hasAnything = items.length > 0;

  return (
    <>
      <PageHeader
        title={
          firstName ? (
            <>
              Welcome back, <span className="text-primary">{firstName}</span>.
            </>
          ) : (
            'Welcome back.'
          )
        }
      />

      <Spotlight last={last} />

      {!loading && <GettingStarted resumes={items} interviews={runs} />}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        hasAnything && (
          <>
            {/* What it all adds up to, and what to do about it. */}
            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <StandingCard interviews={runs} />
              <NextStep interviews={runs} resumes={items} />
            </div>

            <ResumeShelf resumes={items} />
            <InterviewList interviews={runs} />
          </>
        )
      )}
    </>
  );
}

/* ── Spotlight ── */

function Spotlight({ last }: { last: LastResume | null }) {
  return (
    <section className="edge-top relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
      {/* Top-right glow: light theme only — dark keeps the flat card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [[data-theme=dark]_&]:hidden"
        style={{
          background:
            'radial-gradient(70% 130% at 88% 0%, rgba(169,211,255,0.12), transparent 60%)',
        }}
      />
      <Waves />

      <div className="relative max-w-xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
          Go beyond the <span className="text-primary">resume</span>.
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Upload a resume and Intervio extracts the claims worth defending —
          then puts them to the test in a live voice interview.
        </p>
        {last ? (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={last.href}>
                <Button className="h-11 px-5 text-[15px]">
                  Continue with last resume
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/new">
                <Button variant="outline" className="h-11 px-5 text-[15px]">
                  Analyze a new resume
                </Button>
              </Link>
            </div>
            <p className="mt-3 truncate text-sm text-muted-foreground">
              {last.resume.fileName}
              {last.role && ` · last interviewed as ${last.role}`}
            </p>
          </>
        ) : (
          <Link href="/new" className="mt-6 inline-block">
            <Button className="h-11 px-5 text-[15px]">
              Analyze a resume
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </section>
  );
}

/* Faint, on-brand equalizer — decorative (not data). */
function Waves() {
  const bars = [40, 62, 92, 68, 112, 80, 52, 88, 46];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 items-center gap-2 opacity-40 lg:flex"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="eq-bar w-1.5 rounded-full bg-primary"
          style={{ height: h, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

/* ── Loading ── */

function DashboardSkeleton() {
  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-44 rounded-2xl" />
      </div>
      <Skeleton className="mb-3 mt-10 h-4 w-24" />
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-0"
          >
            <Skeleton className="h-9 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </>
  );
}
