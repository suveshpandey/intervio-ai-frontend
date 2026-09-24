'use client';

import { Badge } from '@/components/ui/badge';
import type { PlanSection, TranscriptTurn } from '@/lib/contracts';

/** How each answer landed — the same judgement the report's numbers come from. */
function AnswerBadges({ evaluation }: { evaluation: NonNullable<TranscriptTurn['evaluation']> }) {
  const { claimEvidence, issue, answerQuality } = evaluation;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {claimEvidence === 'support' && <Badge tone="success">Backed the claim</Badge>}
      {claimEvidence === 'partial' && <Badge tone="warning">Partly backed it</Badge>}
      {claimEvidence === 'weaken' && <Badge tone="destructive">Raised doubt</Badge>}
      {issue === 'generic' && <Badge tone="muted">Stayed general</Badge>}
      {issue === 'memorized' && <Badge tone="muted">Textbook answer</Badge>}
      {issue === 'no_answer' && <Badge tone="muted">Didn&apos;t know</Badge>}
      {issue === 'off_topic' && <Badge tone="muted">Off topic</Badge>}
      <span className="font-mono text-[11px] text-muted-foreground/60">
        {(answerQuality * 10).toFixed(1)}/10
      </span>
    </div>
  );
}

/** The interview as it happened: every question, your answer, and how it scored. */
export function TranscriptView({ turns, sections }: { turns: TranscriptTurn[]; sections: PlanSection[] }) {
  if (turns.length === 0) {
    return <p className="text-sm text-muted-foreground">This interview has no questions yet.</p>;
  }

  const titleFor = (key: string) => sections.find((s) => s.key === key)?.title ?? key;

  return (
    <ol className="space-y-4">
      {turns.map((turn, i) => {
        // Label a section only where it starts, so the list reads as one conversation.
        const newSection = i === 0 || turns[i - 1]!.sectionKey !== turn.sectionKey;
        return (
          <li key={turn.idx}>
            {newSection && (
              <p className="mb-2 mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60 first:mt-0">
                {titleFor(turn.sectionKey)}
              </p>
            )}
            <article className="rounded-2xl border border-border bg-card p-4 sm:p-5">
              <div className="flex gap-3">
                <span className="font-mono text-xs text-muted-foreground/60">{turn.idx + 1}</span>
                <p className="text-[15px] leading-relaxed">{turn.question}</p>
              </div>

              {turn.answer ? (
                <div className="mt-3 border-l-2 border-border pl-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">You</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/85">{turn.answer}</p>
                </div>
              ) : (
                <p className="mt-3 pl-4 text-sm text-muted-foreground/70">No answer recorded.</p>
              )}

              {turn.evaluation && <AnswerBadges evaluation={turn.evaluation} />}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
