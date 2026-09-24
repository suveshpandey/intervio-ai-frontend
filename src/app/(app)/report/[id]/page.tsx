'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { DownloadIcon } from '@/components/icons';
import { ClaimCard } from '@/components/report/claim-card';
import { useReport } from '@/lib/interviews';
import { cn } from '@/lib/utils';
import type { Report, Verdict } from '@/lib/contracts';

const VERDICTS: Record<Verdict, { label: string; blurb: string; tone: 'success' | 'warning' | 'destructive' }> = {
  ready: {
    label: 'Ready',
    blurb: 'You backed up what your resume claims.',
    tone: 'success',
  },
  almost: {
    label: 'Almost there',
    blurb: 'Most of it held up. A few answers need work.',
    tone: 'warning',
  },
  not_ready: {
    label: 'Not ready yet',
    blurb: "The claims on your resume didn't hold up under questioning.",
    tone: 'destructive',
  },
};

function downloadJson(report: Report) {
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `intervio-report-${report.interviewId.slice(0, 8)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportPage() {
  const interviewId = useParams<{ id: string }>().id;
  const { data, isLoading, error } = useReport(interviewId);

  if (isLoading) return <PageLoader label="Putting your report together…" />;

  if (error || !data) {
    // "Too short" and "not finished" arrive here too — both are real answers.
    const message = error instanceof Error ? error.message : 'We couldn&apos;t load this report.';
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="font-medium">{message}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          A report needs at least three answered questions.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const report = data.report;
  const verdict = VERDICTS[report.readiness.verdict];
  const { stats } = report;

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* Verdict */}
      <header className="rise">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {report.role} · {report.level}
          </p>
          {report.partial && <Badge tone="muted">Ended early</Badge>}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{verdict.label}</h1>
            <p className="mt-1.5 text-muted-foreground">{verdict.blurb}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadJson(report)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <DownloadIcon className="h-4 w-4" />
            JSON
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span>
            <strong className="text-foreground">{stats.claimsSupported}</strong> of {stats.claimsProbed} claims backed up
          </span>
          <span>
            <strong className="text-foreground">{stats.answeredTurns}</strong> questions answered
          </span>
          {stats.claimsNotCovered > 0 && <span>{stats.claimsNotCovered} not covered</span>}
        </div>
      </header>

      {/* What the interviewer made of it */}
      <section className="rise rounded-2xl border border-border bg-card p-5 sm:p-6" style={{ animationDelay: '60ms' }}>
        {report.narrative.split('\n\n').map((para, i) => (
          <p key={i} className={cn('leading-relaxed', i > 0 && 'mt-4')}>
            {para}
          </p>
        ))}
      </section>

      {/* The claim audit — the point of the product */}
      <section className="rise space-y-3" style={{ animationDelay: '120ms' }}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Your resume claims</h2>
          <p className="text-xs text-muted-foreground">What you said, weighed against each line</p>
        </div>
        {report.claimAudit.map((claim) => (
          <ClaimCard key={claim.claimId} claim={claim} />
        ))}
      </section>

      {/* Scores */}
      <section className="rise grid gap-4 md:grid-cols-2" style={{ animationDelay: '180ms' }}>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold tracking-tight">How you answered</h2>
          <dl className="mt-4 space-y-4">
            {report.dimensions.map((d) => (
              <div key={d.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-sm font-medium">{d.label}</dt>
                  <dd className="font-mono text-sm tabular-nums">{d.score.toFixed(1)}</dd>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                  <div className={cn('h-full rounded-full', scoreColor(d.score))} style={{ width: `${d.score * 10}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">{d.detail}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold tracking-tight">Skills the interview touched</h2>
          {report.skills.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No skill came up often enough to score.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {report.skills.slice(0, 8).map((s) => (
                <li key={s.skill}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm capitalize">{s.skill}</span>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {s.score.toFixed(1)}
                      <span className="ml-1.5 text-[11px] text-muted-foreground/70">
                        {s.samples} answer{s.samples === 1 ? '' : 's'}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className={cn('h-full rounded-full', scoreColor(s.score))} style={{ width: `${s.score * 10}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {report.skills.length > 0 && (
            <p className="mt-4 text-xs text-muted-foreground">
              A score from one answer is a hint, not a measurement.
            </p>
          )}
        </div>
      </section>

      {/* What to do next */}
      {report.improvements.length > 0 && (
        <section className="rise" style={{ animationDelay: '240ms' }}>
          <h2 className="text-lg font-semibold tracking-tight">Work on this next</h2>
          <ol className="mt-4 space-y-3">
            {report.improvements.map((imp, i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="font-mono text-sm text-muted-foreground/70">{i + 1}</span>
                <div>
                  <p className="font-medium">{imp.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{imp.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Why this verdict */}
      <section className="rise rounded-2xl border border-border bg-card p-5 sm:p-6" style={{ animationDelay: '300ms' }}>
        <h2 className="text-lg font-semibold tracking-tight">Why this verdict</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {report.readiness.reasons.map((reason, i) => (
            <li key={i}>{reason}</li>
          ))}
        </ul>
        {report.readiness.gaps.length > 0 && (
          <>
            <p className="mt-5 text-sm font-medium">Gaps it found</p>
            <ul className="mt-2 space-y-1.5">
              {report.readiness.gaps.map((gap, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span aria-hidden className="text-muted-foreground/50">
                    ·
                  </span>
                  {gap}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground/70">
          Every score here is computed from what you said in the interview, not written by the model. A claim
          marked &ldquo;not covered&rdquo; was never asked about and counts neither for nor against you.
        </p>
      </section>
    </div>
  );
}

function scoreColor(score: number): string {
  return score >= 7 ? 'bg-success' : score >= 4.5 ? 'bg-warning' : 'bg-destructive';
}
