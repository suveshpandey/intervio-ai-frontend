'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { ReportView } from '@/components/report/report-view';
import { TranscriptView } from '@/components/report/transcript-view';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TrashIcon } from '@/components/icons';
import { useDeleteInterview, useReport, useTranscript } from '@/lib/interviews';
import { useBlueprint } from '@/lib/blueprints';
import { cn } from '@/lib/utils';
import type { InterviewStatus } from '@/lib/contracts';

type Tab = 'transcript' | 'report';

const STATUS: Record<InterviewStatus, { label: string; tone: 'default' | 'success' | 'muted' | 'warning' }> = {
  planned: { label: 'Not started', tone: 'muted' },
  live: { label: 'In progress', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  abandoned: { label: 'Ended early', tone: 'muted' },
};

function minutesBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  return Math.max(1, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60_000));
}

export default function InterviewPage() {
  const interviewId = useParams<{ id: string }>().id;
  const router = useRouter();
  const search = useSearchParams();
  const [tab, setTab] = useState<Tab>(search.get('tab') === 'report' ? 'report' : 'transcript');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteInterview = useDeleteInterview();

  const transcript = useTranscript(interviewId, true);
  const interview = transcript.data?.interview;
  const blueprint = useBlueprint(interview?.blueprintId);
  const report = useReport(interviewId);

  function openTab(next: Tab) {
    setTab(next);
    // Keep the URL shareable without re-running the page's queries.
    router.replace(next === 'report' ? `/interviews/${interviewId}?tab=report` : `/interviews/${interviewId}`, {
      scroll: false,
    });
  }

  if (transcript.isLoading) return <PageLoader label="Loading this interview…" />;

  if (transcript.error || !interview) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="font-medium">We couldn&apos;t load this interview.</p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const status = STATUS[interview.status];
  const answered = transcript.data!.turns.filter((t) => t.answer !== null).length;
  const minutes = minutesBetween(interview.startedAt, interview.endedAt);
  const started = interview.startedAt ? new Date(interview.startedAt) : null;

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <header className="rise">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{interview.role}</h1>
          <Badge tone={status.tone}>{status.label}</Badge>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            title="Delete this interview"
            className="ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {interview.level} level
          {started && ` · ${started.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`}
          {` · ${answered} answer${answered === 1 ? '' : 's'}`}
          {minutes !== null && ` · ${minutes} min`}
        </p>

        {interview.status === 'live' && (
          <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            This interview is still running. Its clock doesn&apos;t pause, so it closes itself once the{' '}
            {interview.durationMin} minutes are up and the report is built from whatever was answered.
          </p>
        )}
      </header>

      {/* Two views of the same interview: what was said, and what it means. */}
      <div className="mt-7 flex gap-1 border-b border-border">
        {(['transcript', 'report'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => openTab(key)}
            aria-current={tab === key ? 'page' : undefined}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors',
              tab === key
                ? 'border-primary font-medium text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {key === 'transcript' ? 'Transcript' : 'Report'}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'transcript' ? (
          <TranscriptView
            turns={transcript.data!.turns}
            sections={blueprint.data?.blueprint.sections ?? []}
          />
        ) : report.isLoading ? (
          <PageLoader label="Putting your report together…" />
        ) : report.data ? (
          <ReportView report={report.data.report} />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-medium">
              {interview.status === 'live' ? 'This interview is still running.' : 'No report for this one.'}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              {interview.status === 'live'
                ? 'It is built automatically once the interview’s time is up.'
                : `A report needs at least three answered questions — this one has ${answered}.`}
            </p>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this interview?"
          body={
            <>
              Its transcript{answered > 0 && ` (${answered} answer${answered === 1 ? '' : 's'})`} and report
              are deleted for good. Your resume and its claims stay.
            </>
          }
          confirmLabel="Delete interview"
          loading={deleteInterview.isPending}
          error={deleteInterview.error instanceof Error ? deleteInterview.error.message : null}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteInterview.mutate(interviewId, { onSuccess: () => router.replace('/dashboard') })
          }
        />
      )}
    </div>
  );
}
