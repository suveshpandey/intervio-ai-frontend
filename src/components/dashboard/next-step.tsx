import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons';
import { accessFor } from '@/lib/interview-status';
import type { InterviewSummary, Resume } from '@/lib/contracts';

interface Step {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  live?: boolean;
}

/**
 * The single most useful thing to do next, worked out from where the user is:
 * a running interview beats everything, then what didn't hold up last time,
 * then getting a first interview going.
 */
function pick(interviews: InterviewSummary[], resumes: Resume[]): Step {
  const open = interviews.find(
    (i) => i.status === 'live' || i.status === 'planned',
  );
  if (open) {
    const access = accessFor(open, Date.now());
    const waiting = open.status === 'planned';
    const left = access.detail.replace(
      /^(Ready to join · closes in |Rejoin within )/,
      '',
    );
    return {
      eyebrow: waiting ? 'Ready to start' : 'In progress',
      title: waiting
        ? 'Your interview is ready'
        : 'Your interview is still running',
      body: waiting
        ? `${open.role} — the clock hasn’t started. Join within ${left} or it closes.`
        : access.short === 'Rejoin'
          ? `${open.role} — you left. Rejoin within ${left} or it ends; the clock hasn’t paused.`
          : `${open.role} — the clock doesn’t pause, so pick it back up now.`,
      href: `/interview/${open.id}`,
      cta: waiting ? 'Join interview' : 'Rejoin interview',
      live: true,
    };
  }

  const latest = interviews.find((i) => i.claims);
  if (
    latest?.claims &&
    latest.claims.claimsSupported < latest.claims.claimsProbed
  ) {
    const gap = latest.claims.claimsProbed - latest.claims.claimsSupported;
    return {
      eyebrow: 'Next step',
      title: `Rehearse the ${gap === 1 ? 'claim' : `${gap} claims`} that didn’t hold up`,
      body: 'Your last report shows exactly what was missing. Fix the story, then try again.',
      href: `/interviews/${latest.id}?tab=report`,
      cta: 'Open last report',
    };
  }

  const ready = resumes.find((r) => r.parseStatus === 'done');
  if (ready) {
    return {
      eyebrow: 'Next step',
      title: latest ? 'Go again, a level up' : 'Take your first interview',
      body: latest
        ? 'Everything held up last time. Try a harder interview to find the edges.'
        : 'Your resume is ready. Your target is saved once, so starting is one click.',
      href: `/resumes/${ready.id}`,
      cta: latest ? 'Start an interview' : 'Start your first interview',
    };
  }

  return {
    eyebrow: 'Next step',
    title: 'Upload your resume',
    body: 'Intervio reads it and builds an interview around the work you’ve actually done.',
    href: '/new',
    cta: 'Upload a resume',
  };
}

export function NextStep({
  interviews,
  resumes,
}: {
  interviews: InterviewSummary[];
  resumes: Resume[];
}) {
  const step = pick(interviews, resumes);

  return (
    <section className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
        {step.live && (
          <span
            aria-hidden
            className="live-dot h-1.5 w-1.5 rounded-full bg-success"
          />
        )}
        {step.eyebrow}
      </p>
      <p className="mt-3 text-lg font-medium leading-snug tracking-tight">
        {step.title}
      </p>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {step.body}
      </p>
      <Link
        href={step.href}
        className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition-[gap] hover:gap-2.5"
      >
        {step.cta}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}
