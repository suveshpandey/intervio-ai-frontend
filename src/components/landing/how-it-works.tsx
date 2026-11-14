import { cn } from '@/lib/utils';

/**
 * Three steps as a journey rather than a table: numbered stops on one line,
 * each its own card. The interview — the actual product — is the featured stop;
 * the resume and the report are what come before and after it.
 */

interface Step {
  title: string;
  body: string;
  /** A small, specific detail that shows the step instead of an icon. */
  detail: React.ReactNode;
  featured?: boolean;
}

const STEPS: Step[] = [
  {
    title: 'Share your resume',
    body: 'Upload a PDF or DOCX, plus the job description if you have one. Intervio picks out the work an interviewer would ask you about.',
    detail: (
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <span className="rounded-md border border-border bg-surface px-2 py-1">resume.pdf</span>
        <span aria-hidden>→</span>
        <span>12 claims found</span>
      </div>
    ),
  },
  {
    title: 'Take a live mock interview',
    body: 'Talk it through out loud, like a real call. It asks about your actual projects, follows up when an answer is vague, and moves on when you’ve nailed it.',
    detail: (
      <div className="flex items-center gap-2.5">
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[7, 12, 16, 10, 14, 6, 11].map((h, i) => (
            <span key={i} className="w-[3px] rounded-full bg-primary/70" style={{ height: h }} />
          ))}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">15 min · spoken · live captions</span>
      </div>
    ),
    featured: true,
  },
  {
    title: 'Get your interview report',
    body: 'See which answers held up and which didn’t, your skill scores, and the three things to practise before the real interview.',
    detail: (
      <div className="flex items-center gap-3 font-mono text-[11px]">
        <span className="text-success">✓ 2 held up</span>
        <span className="text-warning">~ 1 partly</span>
        <span className="text-muted-foreground">3 to practise</span>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <ol className="space-y-3">
      {STEPS.map((step, i) => (
        <li
          key={step.title}
          className={cn(
            'rounded-3xl border bg-card p-5 shadow-float',
            step.featured ? 'border-primary/40' : 'border-border',
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-xs font-medium',
                step.featured ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <h3 className="text-base font-medium tracking-tight">{step.title}</h3>
          </div>
          <div className="mt-3 pl-10">{step.detail}</div>
        </li>
      ))}
    </ol>
  );
}
