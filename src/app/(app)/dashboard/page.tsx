'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/app/page-header';
import { ArrowRightIcon } from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import { useInterviews } from '@/lib/interviews';
import { ResumeRow, InterviewRow } from '@/components/app/rows';
import type { InterviewSummary } from '@/lib/contracts';

export default function DashboardPage() {
  const { user } = useSession();
  const resumes = useResumes();
  const interviews = useInterviews();
  const items = resumes.data?.resumes ?? [];
  const runs = interviews.data?.interviews ?? [];
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const loading = resumes.isLoading || interviews.isLoading;
  const hasAnything = items.length > 0;
  const live = runs.find((r) => r.status === 'live');
  const reported = runs.filter((r) => r.claims !== null);
  const backed = reported.reduce((n, r) => n + (r.claims?.claimsSupported ?? 0), 0);
  const probed = reported.reduce((n, r) => n + (r.claims?.claimsProbed ?? 0), 0);

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

      <Spotlight />

      {live && <LiveInterviewCard interview={live} />}

      {!loading && hasAnything && (
        <Stats
          resumes={items.length}
          interviews={runs.filter((r) => r.status !== 'live').length}
          backed={backed}
          probed={probed}
        />
      )}

      {loading ? (
        <RecentSkeleton />
      ) : !hasAnything ? (
        <section className="mt-10">
          <EmptyHint />
        </section>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Panel title="Resumes" actionLabel="Analyze another" actionHref="/new">
            <ul className="max-h-[21rem] overflow-y-auto">
              {items.map((r) => (
                <ResumeRow key={r.id} resume={r} />
              ))}
            </ul>
          </Panel>

          <Panel title="Interviews">
            {runs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No interviews yet. Open a ready resume to set one up.
              </p>
            ) : (
              <ul className="max-h-[21rem] overflow-y-auto">
                {runs.map((r) => (
                  <InterviewRow key={r.id} interview={r} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}

/* ── Panels ── */

function Panel({
  title,
  actionLabel,
  actionHref,
  children,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">{children}</div>
    </section>
  );
}

/* ── An interview still running: the one thing worth interrupting for ── */

function LiveInterviewCard({ interview }: { interview: InterviewSummary }) {
  return (
    <Link
      href={`/interview/${interview.id}`}
      className="mt-6 flex items-center gap-4 rounded-xl border border-primary/40 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10"
    >
      <span className="live-dot h-2 w-2 shrink-0 rounded-full bg-success" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Interview in progress</p>
        <p className="truncate text-xs text-muted-foreground">
          {interview.role} · the clock is running
        </p>
      </div>
      <span className="shrink-0 text-sm text-primary">Continue</span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}

/* ── Interview row ── */

/* ── Analytics (sharp, hairline-divided strip) ── */

function Stats({
  resumes,
  interviews,
  backed,
  probed,
}: {
  resumes: number;
  interviews: number;
  backed: number;
  probed: number;
}) {
  return (
    <div className="mt-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
      <StatCell label="Resumes" value={resumes} />
      <StatCell label="Interviews" value={interviews} />
      {/* The number the product exists for. */}
      <StatCell
        label="Claims backed up"
        value={probed ? `${backed}/${probed}` : '—'}
        dot={probed ? 'bg-success' : undefined}
      />
    </div>
  );
}

function StatCell({ label, value, dot }: { label: string; value: number | string; dot?: string }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/* ── Spotlight ── */

function Spotlight() {
  return (
    <section className="edge-top relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
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
          Upload a resume and Intervio extracts the claims worth defending — then puts them to the
          test in a live voice interview.
        </p>
        <Link href="/new" className="mt-6 inline-block">
          <Button className="h-11 px-5 text-[15px]">
            Analyze a resume
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

/* Faint, on-brand equalizer — decorative (not data). */
function Waves() {
  const bars = [26, 40, 60, 44, 72, 52, 34, 58, 30];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 opacity-40 lg:flex"
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="eq-bar w-1 rounded-full bg-primary"
          style={{ height: h, animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </div>
  );
}

/* ── Resume row (clean list) ── */

function RecentSkeleton() {
  return (
    <>
      <div className="-mt-4 mb-6 grid grid-cols-3 divide-x divide-border overflow-hidden rounded-xl border border-border bg-card">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="px-5 py-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2.5 h-6 w-8" />
          </div>
        ))}
      </div>
      <Skeleton className="mb-3 h-4 w-20" />
      <ul className="overflow-hidden rounded-xl border border-border bg-card">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Empty (has spotlight above; keep this quiet) ── */

function EmptyHint() {
  const steps = ['Upload resume', 'Live interview', 'Readiness report'];
  return (
    <div className="rounded-xl border border-dashed border-border px-6 py-8 text-center">
      <p className="text-sm text-muted-foreground">Your analyzed resumes will show up here.</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-3">
            {i > 0 && <span className="text-muted-foreground/40">→</span>}
            <span>
              <span className="font-mono text-xs text-primary">{i + 1}</span> {s}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
