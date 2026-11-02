import { Reveal } from '@/components/landing/reveal';
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
    <div className="relative mt-14">
      {/* The line the steps sit on — desktop only, where they're side by side. */}
      <div
        aria-hidden
        className="absolute left-[16.66%] right-[16.66%] top-4 hidden h-px md:block"
        style={{
          background:
            'linear-gradient(90deg, var(--border), color-mix(in oklab, var(--primary) 55%, transparent), var(--border))',
        }}
      />

      <div className="grid gap-5 md:grid-cols-3 md:gap-6">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 110} className="flex flex-col items-stretch">
            <div className="flex h-full flex-col">
              {/* The stop on the line. */}
              <span
                className={cn(
                  'relative z-10 mx-auto grid h-8 w-8 place-items-center rounded-full border font-mono text-xs font-medium',
                  step.featured
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {i + 1}
              </span>

              <div
                className={cn(
                  'mt-5 flex flex-1 flex-col rounded-2xl border p-6 transition-colors',
                  step.featured
                    ? 'border-primary/40 shadow-pop'
                    : 'border-border bg-card hover:border-primary/25',
                )}
                style={
                  step.featured
                    ? {
                        background:
                          'linear-gradient(180deg, color-mix(in oklab, var(--primary) 9%, var(--card)), var(--card) 70%)',
                      }
                    : undefined
                }
              >
                {step.featured && (
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    The interview
                  </p>
                )}
                <h3 className="text-lg font-medium tracking-tight">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                <div className="mt-6 border-t border-border pt-4">{step.detail}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
