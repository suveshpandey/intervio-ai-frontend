'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/page-loader';
import { useTranscript, useSubmitAnswer } from '@/lib/interviews';
import { useBlueprint } from '@/lib/blueprints';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { PlanSection } from '@/lib/contracts';

/** Matches the backend clamp so our local clock stays in sync with the engine's. */
const MIN_TURN_SECONDS = 5;
const MAX_TURN_SECONDS = 300;

interface Exchange {
  question: string;
  answer: string | null;
}

export default function InterviewPage() {
  const interviewId = useParams<{ id: string }>().id;

  const transcript = useTranscript(interviewId, true);
  const blueprintId = transcript.data?.interview.blueprintId;
  const blueprint = useBlueprint(blueprintId);
  const submit = useSubmitAnswer(interviewId);

  const [history, setHistory] = useState<Exchange[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [sectionKey, setSectionKey] = useState<string>('');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [done, setDone] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const askedAt = useRef<number>(Date.now());
  const bottomRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // Rebuild local state from the server once (so a refresh mid-interview resumes).
  useEffect(() => {
    if (hydrated.current || !transcript.data) return;
    hydrated.current = true;

    const { interview, turns } = transcript.data;
    const answered = turns.filter((t) => t.answer !== null);
    const pending = turns.find((t) => t.answer === null);

    setHistory(answered.map((t) => ({ question: t.question, answer: t.answer })));
    setQuestion(pending?.question ?? null);
    setSectionKey(pending?.sectionKey ?? turns.at(-1)?.sectionKey ?? '');
    setDone(interview.status === 'completed' || !pending);
    askedAt.current = Date.now();
  }, [transcript.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history.length, question, done]);

  if (transcript.isLoading) return <PageLoader label="Loading your interview…" />;
  if (transcript.error) {
    return <p className="text-sm text-destructive">Couldn&apos;t load this interview.</p>;
  }

  const sections: PlanSection[] = blueprint.data?.blueprint.sections ?? [];
  const durationMin = blueprint.data?.blueprint.durationMin ?? 0;
  const secondsLeft = Math.max(0, durationMin * 60 - elapsedSec);
  const sectionIdx = sections.findIndex((s) => s.key === sectionKey);

  async function onSend() {
    const answer = draft.trim();
    if (!answer || submit.isPending) return;
    setError(null);

    const turnSeconds = Math.min(
      MAX_TURN_SECONDS,
      Math.max(MIN_TURN_SECONDS, Math.round((Date.now() - askedAt.current) / 1000)),
    );

    // Show the answer immediately; the engine takes a beat to reply.
    const asked = question ?? '';
    setHistory((h) => [...h, { question: asked, answer }]);
    setQuestion(null);
    setDraft('');

    try {
      const res = await submit.mutateAsync({ answer, turnSeconds });
      setElapsedSec((s) => s + turnSeconds);
      setSectionKey(res.sectionKey);
      askedAt.current = Date.now();
      if (res.done) setDone(true);
      else setQuestion(res.question);
    } catch (err) {
      // Put them back where they were so nothing is lost.
      setHistory((h) => h.slice(0, -1));
      setQuestion(asked);
      setDraft(answer);
      setError(err instanceof ApiError ? err.message : 'Could not send that answer. Try again.');
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col">
      {/* Status bar */}
      <div className="sticky top-16 z-10 -mx-6 mb-8 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-sm font-medium">
            {sections[sectionIdx]?.title ?? (done ? 'Finished' : 'Interview')}
          </span>
          {durationMin > 0 && !done && (
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} left
            </span>
          )}
        </div>
        {sections.length > 0 && (
          <div className="mt-2 flex gap-1">
            {sections.map((s, i) => (
              <span
                key={s.key}
                title={s.title}
                style={{ flex: s.budgetMin }}
                className={cn(
                  'h-1 rounded-full transition-colors',
                  done || i < sectionIdx ? 'bg-primary/60' : i === sectionIdx ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Conversation */}
      <div className="flex-1 space-y-6">
        {history.map((x, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm text-muted-foreground">{x.question}</p>
            <div className="rounded-[var(--radius)] border border-border bg-card px-4 py-3 text-sm">
              {x.answer}
            </div>
          </div>
        ))}

        {question && (
          <div className="rounded-[var(--radius)] border border-primary/30 bg-primary/5 px-4 py-4">
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-primary/70">
              Interviewer
            </p>
            <p className="text-[15px] leading-relaxed">{question}</p>
          </div>
        )}

        {submit.isPending && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="dash-line" style={{ width: 60 }} /> thinking…
          </p>
        )}

        {done && (
          <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center">
            <Badge tone="success">Interview complete</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              {history.length} question{history.length === 1 ? '' : 's'} answered. Your readiness
              report arrives in a later phase.
            </p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      {!done && (
        <div className="sticky bottom-0 -mx-6 mt-8 border-t border-border bg-background/80 px-6 py-4 backdrop-blur-xl">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
          <div className="flex items-end gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void onSend();
              }}
              placeholder="Type your answer…"
              rows={3}
              disabled={submit.isPending}
              className="min-h-[4.5rem]"
            />
            <Button onClick={onSend} disabled={submit.isPending || !draft.trim()}>
              Send
            </Button>
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
            ⌘/Ctrl + Enter to send · voice arrives in Phase 4
          </p>
        </div>
      )}
    </div>
  );
}
