'use client';

import { MicIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Hearing } from '@/lib/interview-session';

/**
 * Tells the candidate when their voice isn't getting through.
 *
 * The server notices a speech stream that hears a voice but returns no words and
 * replaces it on its own; this is the human side of that. Without it, a stuck
 * stream looked exactly like the interviewer ignoring them. There is no typing
 * fallback (product call) — the advice is always to try speaking again.
 */
const COPY: Record<Exclude<Hearing, 'ok'>, { title: string; body: string; tone: 'warn' | 'ok' }> = {
  trouble: {
    title: 'Having trouble hearing you',
    body: 'Reconnecting — keep talking, we won’t lose what you’ve said.',
    tone: 'warn',
  },
  lost: {
    title: 'We still can’t hear you clearly',
    body: 'Try a quieter spot, move closer to your mic or check it’s the right one, then say your answer again.',
    tone: 'warn',
  },
  recovered: {
    title: 'We can hear you again',
    body: 'You may need to repeat your last sentence.',
    tone: 'ok',
  },
};

export function HearingNotice({ hearing }: { hearing: Hearing }) {
  if (hearing === 'ok') return null;
  const copy = COPY[hearing];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'animate-pop flex w-full max-w-3xl items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        copy.tone === 'warn'
          ? 'border-warning/30 bg-warning/10 text-warning'
          : 'border-success/30 bg-success/10 text-success',
      )}
    >
      <span className="mt-0.5 shrink-0">
        {hearing === 'trouble' ? (
          // Reconnecting: a gentle pulse rather than a static icon.
          <span className="relative flex h-4 w-4 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-warning/40" />
            <MicIcon className="relative h-4 w-4" />
          </span>
        ) : (
          <MicIcon className="h-4 w-4" />
        )}
      </span>
      <div>
        <p className="font-medium">{copy.title}</p>
        <p className="mt-0.5 opacity-85">{copy.body}</p>
      </div>
    </div>
  );
}
