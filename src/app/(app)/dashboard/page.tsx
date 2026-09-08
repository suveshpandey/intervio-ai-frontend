'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/app/page-header';
import {
  FileIcon,
  UploadIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  InterviewsIcon,
  ReportsIcon,
} from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import type { ParseStatus, Resume } from '@/lib/contracts';

const STATUS: Record<
  ParseStatus,
  { label: string; tone: 'default' | 'muted' | 'success' | 'warning' | 'destructive'; action: string }
> = {
  pending: { label: 'Queued', tone: 'muted', action: 'Preparing…' },
  processing: { label: 'Analyzing', tone: 'warning', action: 'Analyzing…' },
  done: { label: 'Ready', tone: 'success', action: 'View claims' },
  failed: { label: 'Failed', tone: 'destructive', action: 'See details' },
};

export default function DashboardPage() {
  const { user } = useSession();
  const resumes = useResumes();
  const items = resumes.data?.resumes ?? [];
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const ready = items.filter((r) => r.parseStatus === 'done').length;
  const inProgress = items.filter(
    (r) => r.parseStatus === 'pending' || r.parseStatus === 'processing',
  ).length;

  const hasItems = items.length > 0;

  return (
    <>
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ''}.`}
        description="Your interview-prep home — analyze a resume, then put its claims to the test."
        actions={
          hasItems ? (
            <Link href="/new">
              <Button>
                <UploadIcon className="h-4 w-4" />
                Analyze a resume
              </Button>
            </Link>
          ) : undefined
        }
      />

      {resumes.isLoading ? (
        <ResumeGridSkeleton />
      ) : !hasItems ? (
        <FirstRun />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Resumes" value={items.length} />
            <Stat label="Ready" value={ready} />
            <Stat label="In progress" value={inProgress} />
          </div>

          <section className="mt-8">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Your resumes</h2>
              <Link
                href="/new"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Analyze another
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((r) => (
                <ResumeCard key={r.id} resume={r} />
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

/* ── Stat tile (real counts) ── */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/* ── Resume card ── */

function ResumeCard({ resume }: { resume: Resume }) {
  const meta = STATUS[resume.parseStatus];
  return (
    <Link
      href={`/resumes/${resume.id}`}
      className="edge-top group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary">
          <FileIcon className="h-5 w-5" />
        </span>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      <p className="mt-4 truncate font-medium">{resume.fileName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {new Date(resume.createdAt).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </p>
      <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
        {meta.action}
        <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function ResumeGridSkeleton() {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-4 py-3.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-6 w-8" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
    </>
  );
}

/* ── First run (no resumes yet) ── */

const STEPS = [
  { n: '01', icon: FileIcon, title: 'Upload resume', body: 'PDF or DOCX, plus an optional job description.' },
  { n: '02', icon: InterviewsIcon, title: 'Live voice interview', body: 'Adaptive questions that probe your claims.' },
  { n: '03', icon: ReportsIcon, title: 'Readiness report', body: 'Scores, a claim audit, and what to fix.' },
];

function FirstRun() {
  return (
    <div className="space-y-8">
      <div className="edge-top flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
          <UploadIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">Analyze your first resume</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Upload a PDF or DOCX and Intervio pulls out the claims worth defending — the starting
          point for a live interview.
        </p>
        <Link href="/new" className="mt-6">
          <Button className="h-11 px-5 text-[15px]">
            Analyze a resume
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div>
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          How it works
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, body }) => (
            <div key={n} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-sm text-muted-foreground/30">{n}</span>
              </div>
              <p className="mt-4 font-medium">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
