'use client';

import Link from 'next/link';
import { CheckIcon, ArrowRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { InterviewSummary, Resume } from '@/lib/contracts';

/**
 * First-run guidance.
 *
 * Signing up used to drop people on an empty dashboard with no idea what to do,
 * and the old hint was three decorative words. This tracks the real loop from
 * their actual data and disappears for good once they have finished it — no
 * dismiss button to fiddle with, nothing to remember.
 */
export function GettingStarted({
  resumes,
  interviews,
}: {
  resumes: Resume[];
  interviews: InterviewSummary[];
}) {
  const ready = resumes.find((r) => r.parseStatus === 'done');
  const analyzing = resumes.some((r) => r.parseStatus === 'pending' || r.parseStatus === 'processing');
  const interviewed = interviews.some((i) => i.status !== 'live');
  const reported = interviews.some((i) => i.verdict !== null);

  // They have been all the way round — nothing left to explain.
  if (reported) return null;

  const steps = [
    {
      title: 'Upload your resume',
      body: analyzing
        ? 'Reading it now — this takes a few seconds.'
        : 'A PDF or DOCX. Intervio pulls out the claims worth defending.',
      done: resumes.length > 0,
      href: '/new',
      cta: 'Upload',
    },
    {
      title: 'Check the plan',
      body: 'See which claims it will probe, and pick your interviewer voice.',
      done: interviews.length > 0,
      href: ready ? `/resumes/${ready.id}` : undefined,
      cta: 'Review claims',
    },
    {
      title: 'Talk it through',
      body: 'A spoken interview in your browser. Answer out loud, like the real thing.',
      done: interviewed,
      href: undefined,
      cta: undefined,
    },
    {
      title: 'Read your report',
      body: 'What you backed up, what you didn’t, and what to fix.',
      done: reported,
      href: undefined,
      cta: undefined,
    },
  ];

  // The first unfinished step is the one to act on.
  const currentIdx = steps.findIndex((s) => !s.done);

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-medium">Getting started</h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {steps.filter((s) => s.done).length} of {steps.length}
        </span>
      </div>

      <ol>
        {steps.map((step, i) => {
          const current = i === currentIdx;
          return (
            <li
              key={step.title}
              className={cn(
                'flex items-center gap-4 border-b border-border px-5 py-4 last:border-0',
                current && 'bg-muted/40',
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-xs',
                  step.done
                    ? 'border-success/30 bg-success/10 text-success'
                    : current
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground/50',
                )}
              >
                {step.done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.done && 'text-muted-foreground line-through decoration-muted-foreground/40',
                  )}
                >
                  {step.title}
                </p>
                {current && <p className="mt-0.5 text-xs text-muted-foreground">{step.body}</p>}
              </div>

              {current && step.href && step.cta && (
                <Link
                  href={step.href}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {step.cta}
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
