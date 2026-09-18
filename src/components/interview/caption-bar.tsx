'use client';

import { cn } from '@/lib/utils';

/**
 * Live captions, meeting-style: the interviewer's question stays up while you
 * answer (so you can re-read it), and your own words appear beneath it live.
 */
export function CaptionBar({
  interviewerName,
  question,
  interim,
  thinking,
}: {
  interviewerName: string;
  question: string | null;
  interim: string;
  thinking: boolean;
}) {
  return (
    <div
      aria-live="polite"
      className="w-full max-w-3xl rounded-2xl border border-border bg-card/70 px-5 py-4 backdrop-blur-xl"
    >
      {thinking ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="dash-line" style={{ width: 48 }} />
          {interviewerName} is thinking…
        </p>
      ) : question ? (
        <>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary/70">{interviewerName}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">{question}</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Waiting for the next question…</p>
      )}

      <div className={cn('overflow-hidden transition-all duration-200', interim ? 'mt-3 max-h-24 opacity-100' : 'max-h-0 opacity-0')}>
        <div className="border-t border-border pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">You</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/85">{interim}</p>
        </div>
      </div>
    </div>
  );
}
