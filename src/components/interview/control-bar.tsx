'use client';

import { useState } from 'react';
import { MicIcon, MicOffIcon, PhoneOffIcon } from '@/components/icons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';

/**
 * The meeting controls: mic toggle + hang up, in one capsule.
 *
 * Ending asks once, in a proper centred dialog — one stray click on a big red
 * button shouldn't throw away a real interview, and an ended one can't resume.
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
  const micOff = muted || !micAvailable;

  return (
    <>
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
          onClick={() => setConfirming(true)}
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

      {confirming && (
        <ConfirmDialog
          tone="hangup"
          icon={<PhoneOffIcon className="h-5 w-5" />}
          title="End the interview?"
          body={
            <>
              You won&apos;t be able to resume it. If you&apos;ve answered at least three questions,
              your report will be built from what you&apos;ve said so far.
            </>
          }
          cancelLabel="Keep going"
          confirmLabel={ending ? 'Ending…' : 'End interview'}
          loading={ending}
          onCancel={() => setConfirming(false)}
          onConfirm={onEnd}
        />
      )}
    </>
  );
}
