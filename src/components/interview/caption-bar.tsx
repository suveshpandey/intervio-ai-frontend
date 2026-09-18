'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/** Stagger for the question's word-by-word reveal, capped so long questions don't crawl. */
const WORD_STAGGER_MS = 28;
const MAX_STAGGER_MS = 900;

/**
 * Words as stable spans keyed by position. A word only animates when it first
 * mounts, so text that's already on screen never re-flashes; when Deepgram
 * revises a word in place, it just changes quietly.
 */
function Words({ text, stagger = 0, settled = Infinity }: { text: string; stagger?: number; settled?: number }) {
  if (!text) return null;
  return (
    <>
      {text.split(/\s+/).map((word, i) => (
        <span
          key={i}
          className={cn('caption-word transition-colors duration-300', i >= settled && 'text-foreground/55')}
          style={stagger ? { animationDelay: `${Math.min(i * stagger, MAX_STAGGER_MS)}ms` } : undefined}
        >
          {word}{' '}
        </span>
      ))}
    </>
  );
}

/**
 * Live captions, meeting-style: the interviewer's question stays up while you
 * answer (so you can re-read it), and your words build up live beneath it.
 */
export function CaptionBar({
  interviewerName,
  question,
  heard,
  interim,
  thinking,
}: {
  interviewerName: string;
  question: string | null;
  /** Locked phrases of your answer. */
  heard: string;
  /** The phrase Deepgram is still revising. */
  interim: string;
  thinking: boolean;
}) {
  const answerBox = useRef<HTMLDivElement>(null);
  const hasAnswer = Boolean(heard || interim);

  // Long answers: keep the newest line in view.
  useEffect(() => {
    const el = answerBox.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [heard, interim]);

  return (
    <div aria-live="polite" className="w-full max-w-3xl rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary/75">
        {interviewerName}
        <span
          className={cn(
            'normal-case tracking-normal text-muted-foreground transition-opacity duration-300',
            thinking ? 'opacity-100' : 'opacity-0',
          )}
        >
          is thinking<span className="thinking-dots" />
        </span>
      </div>

      {/* Keyed on the question so each new one gets a fresh reveal. */}
      <p
        key={question ?? ''}
        className={cn(
          'mt-1.5 min-h-[1.6em] text-[15px] leading-relaxed text-foreground transition-opacity duration-300',
          thinking && 'opacity-45',
        )}
      >
        {question ? (
          <Words text={question} stagger={WORD_STAGGER_MS} />
        ) : (
          <span className="text-muted-foreground">Waiting for the next question…</span>
        )}
      </p>

      {/* grid-rows 0fr→1fr animates to the content's real height (max-h can't). */}
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          hasAnswer ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="mt-3 border-t border-border pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">You</p>
            <div ref={answerBox} className="caption-scroll mt-1 max-h-[4.8em] overflow-y-auto text-sm leading-relaxed text-foreground/90">
              {/* One list, so a phrase going interim → final keeps its spans (no re-fade), just firms up. */}
              <Words text={[heard, interim].filter(Boolean).join(' ')} settled={heard ? heard.split(/\s+/).length : 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
