'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/app/page-header';
import { FileIcon, ArrowRightIcon, ChevronRightIcon } from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import type { ParseStatus, Resume } from '@/lib/contracts';

const STATUS: Record<
  ParseStatus,
  { label: string; tone: 'default' | 'muted' | 'success' | 'warning' | 'destructive' }
> = {
  pending: { label: 'Queued', tone: 'muted' },
  processing: { label: 'Analyzing', tone: 'warning' },
  done: { label: 'Ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export default function DashboardPage() {
  const { user } = useSession();
  const resumes = useResumes();
  const items = resumes.data?.resumes ?? [];
  const firstName = user?.name?.trim().split(/\s+/)[0];

  return (
    <>
      <PageHeader title={`Welcome back${firstName ? `, ${firstName}` : ''}.`} />

      <Spotlight />

      <section className="mt-10">
        {resumes.isLoading ? (
          <RecentSkeleton />
        ) : items.length === 0 ? (
          <EmptyHint />
        ) : (
          <>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-sm font-medium text-muted-foreground">Recent</h2>
              <Link
                href="/new"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Analyze another
              </Link>
            </div>
            <ul className="overflow-hidden rounded-xl border border-border bg-card">
              {items.map((r) => (
                <ResumeRow key={r.id} resume={r} />
              ))}
            </ul>
          </>
        )}
      </section>
    </>
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

function ResumeRow({ resume }: { resume: Resume }) {
  const meta = STATUS[resume.parseStatus];
  return (
    <li className="border-b border-border last:border-0">
      <Link
        href={`/resumes/${resume.id}`}
        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors group-hover:text-primary">
          <FileIcon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{resume.fileName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(resume.createdAt).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
      </Link>
    </li>
  );
}

function RecentSkeleton() {
  return (
    <>
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
