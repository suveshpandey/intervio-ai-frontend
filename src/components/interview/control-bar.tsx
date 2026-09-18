'use client';

import { useEffect, useRef, useState } from 'react';
import { MicIcon, MicOffIcon, PhoneOffIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

/**
 * The meeting controls: mic toggle + hang up, in one capsule.
 *
 * Ending asks once — one stray click on a big red button shouldn't throw away a
 * real interview, and an ended interview can't be resumed.
 */
export function ControlBar({
  muted,
  micAvailable,
  ending,
  onToggleMute,
  onEnd,
}: {
  muted: boolean;
  micAvailable: boolean;
  ending: boolean;
  onToggleMute: () => void;
  onEnd: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Dismiss the confirm on outside click / Escape.
  useEffect(() => {
    if (!confirming) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setConfirming(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirming(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [confirming]);

  const micOff = muted || !micAvailable;

  return (
    <div ref={wrap} className="relative">
      {confirming && (
        <div
          role="dialog"
          aria-label="End interview"
          className="animate-pop shadow-pop absolute bottom-full left-1/2 mb-3 w-72 -translate-x-1/2 rounded-2xl border border-border bg-card p-4"
        >
          <p className="font-medium">End the interview?</p>
          <p className="mt-1 text-sm text-muted-foreground">You won&apos;t be able to resume it.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={onEnd}
              disabled={ending}
              className="rounded-lg bg-[var(--hangup)] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[var(--hangup-hover)] disabled:opacity-60"
            >
              {ending ? 'Ending…' : 'End interview'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 p-2 shadow-pop backdrop-blur-xl">
        <button
          type="button"
          onClick={onToggleMute}
          disabled={!micAvailable}
          aria-pressed={muted}
          aria-label={!micAvailable ? 'Microphone unavailable' : muted ? 'Unmute microphone' : 'Mute microphone'}
          title={!micAvailable ? 'Microphone unavailable' : muted ? 'Unmute' : 'Mute'}
          className={cn(
            'grid h-12 w-12 place-items-center rounded-full transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed',
            micOff
              ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
              : 'bg-surface text-foreground hover:bg-muted',
          )}
        >
          {micOff ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={() => setConfirming((c) => !c)}
          aria-label="End interview"
          title="End interview"
          className={cn(
            'flex h-12 items-center gap-2 rounded-full bg-[var(--hangup)] px-6 text-sm font-medium text-white transition-colors',
            'hover:bg-[var(--hangup-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hangup)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
        >
          <PhoneOffIcon className="h-5 w-5" />
          End
        </button>
      </div>
    </div>
  );
}
