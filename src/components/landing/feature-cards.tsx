import { Reveal } from '@/components/landing/reveal';

/**
 * Four separate cards, each showing a small real piece of the product (an
 * actual question, the adapt rules, the repeat request, the verdicts) where a
 * stock icon would otherwise sit. Specific beats generic.
 */

function QuestionDetail() {
  return (
    <p className="resume-serif text-[15px] italic leading-snug text-foreground/85">
      &ldquo;Walk me through the 820 → 190 ms drop. What was actually slow?&rdquo;
    </p>
  );
}

function AdaptDetail() {
  const rules: [string, string][] = [
    ['vague answer', 'digs in'],
    ['solid answer', 'moves on'],
    ['struggling', 'eases off'],
  ];
  return (
    <ul className="space-y-1.5 font-mono text-[11px]">
      {rules.map(([when, then]) => (
        <li key={when} className="flex items-center gap-2">
          <span className="text-muted-foreground">{when}</span>
          <span aria-hidden className="h-px flex-1 border-t border-dashed border-border" />
          <span className="text-foreground/85">{then}</span>
        </li>
      ))}
    </ul>
  );
}

function VoiceDetail() {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-5 items-end gap-[3px]" aria-hidden>
        {[6, 11, 17, 9, 14, 19, 8, 13, 5].map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-primary/65" style={{ height: h }} />
        ))}
      </span>
      <span className="text-[13px] text-muted-foreground">&ldquo;Sorry, can you repeat that?&rdquo;</span>
    </div>
  );
}

function VerdictDetail() {
  const rows = [
    { mark: '✓', label: 'backed up', cls: 'text-success' },
    { mark: '~', label: 'partly', cls: 'text-warning' },
    { mark: '✕', label: 'not enough detail', cls: 'text-destructive' },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] font-medium">
      {rows.map((r) => (
        <span key={r.label} className={r.cls}>
          {r.mark} {r.label}
        </span>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    title: 'Questions about your real work',
    body: 'No question banks. The interviewer asks about the projects and results on your own resume, and checks whether your answers back them up.',
    detail: <QuestionDetail />,
  },
  {
    title: 'An interviewer that adapts',
    body: 'It keeps to time and never repeats itself — reading each answer the way a good interviewer would, not a chatbot.',
    detail: <AdaptDetail />,
  },
  {
    title: 'Spoken, in your browser',
    body: 'A real conversation out loud, with live captions — no phone call, no downloads, no setup. Ask it to repeat a question any time, like you would in person.',
    detail: <VoiceDetail />,
  },
  {
    title: 'Feedback you can act on',
    body: 'Every score comes from what you actually said, not a vibe — and points to the exact answer behind it, plus what to practise next.',
    detail: <VerdictDetail />,
  },
];

export function FeatureCards() {
  return (
    <div className="mt-14 grid gap-5 sm:grid-cols-2">
      {FEATURES.map((f, i) => (
        <Reveal key={f.title} delay={i * 80}>
          <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30">
            {/* The real detail sits on its own inset panel, like a snippet of the app. */}
            <div className="rounded-xl border border-border bg-surface/60 px-4 py-3.5">{f.detail}</div>
            <h3 className="mt-6 text-lg font-medium tracking-tight">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
