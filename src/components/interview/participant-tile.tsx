'use client';

import { MicOffIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export type TileEffect = 'ripple' | 'breathe' | 'level' | null;

export interface TileStatus {
  label: string;
  tone: 'accent' | 'neutral' | 'muted';
  /** Live bars beside the label (the interviewer talking). */
  bars?: boolean;
}

/**
 * One participant in the 1:1 "meeting" — the interviewer or the candidate.
 * No camera: a large avatar carries the presence, and motion around it shows
 * who is talking (ripples for the AI's voice, your real mic level for you).
 */
export function ParticipantTile({
  name,
  subtitle,
  initials,
  variant,
  status,
  effect,
  level = 0,
  active,
  dimmed,
  muted,
}: {
  name: string;
  subtitle: string;
  initials: string;
  variant: 'ai' | 'user';
  status: TileStatus;
  effect: TileEffect;
  /** Mic RMS (0–~0.2 for speech) — drives the ring for `effect: 'level'`. */
  level?: number;
  /** Active speaker: highlighted border, like a video call. */
  active: boolean;
  dimmed?: boolean;
  muted?: boolean;
}) {
  // Speech RMS sits low; scale it into a visible but restrained ring.
  const levelScale = 1 + Math.min(level * 6, 0.45);

  return (
    <section
      aria-label={`${name}, ${subtitle}`}
      className={cn(
        'relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border bg-card transition-all duration-300 sm:aspect-video',
        active ? 'border-primary/60 shadow-[0_0_0_1px_var(--primary),0_0_40px_-12px_var(--primary)]' : 'border-border',
        dimmed && 'opacity-60',
      )}
    >
      {/* Soft depth behind the avatar. */}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          variant === 'ai'
            ? 'bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_62%)]'
            : 'bg-[radial-gradient(circle_at_50%_45%,color-mix(in_oklab,var(--foreground)_6%,transparent),transparent_60%)]',
        )}
      />

      <div className="relative grid place-items-center">
        {effect === 'ripple' &&
          [0, 600, 1200].map((delay) => (
            <span
              key={delay}
              aria-hidden
              className="voice-ripple absolute inset-0 rounded-full border border-primary/50"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        {effect === 'breathe' && (
          <span aria-hidden className="think-breathe absolute -inset-3 rounded-full bg-primary/15" />
        )}
        {effect === 'level' && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-primary/20 transition-transform duration-100 ease-out"
            style={{ transform: `scale(${levelScale})` }}
          />
        )}

        <div
          className={cn(
            'relative grid h-24 w-24 place-items-center rounded-full text-2xl font-semibold tracking-wide sm:h-28 sm:w-28 sm:text-3xl',
            variant === 'ai'
              ? 'bg-gradient-to-br from-primary/35 to-primary/10 text-primary ring-1 ring-primary/35'
              : 'bg-surface text-foreground ring-1 ring-border',
          )}
        >
          {initials}
        </div>
      </div>

      {/* Name tag — bottom left, as in a video call. */}
      <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-lg bg-background/65 px-2.5 py-1.5 backdrop-blur-md">
        {muted && <MicOffIcon className="h-3.5 w-3.5 shrink-0 text-destructive" />}
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{subtitle}</span>
      </div>

      {/* Status — top right. */}
      <div
        className={cn(
          'absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium backdrop-blur-md',
          status.tone === 'accent' && 'border-primary/30 bg-primary/10 text-primary',
          status.tone === 'neutral' && 'border-border bg-background/60 text-muted-foreground',
          status.tone === 'muted' && 'border-destructive/30 bg-destructive/10 text-destructive',
        )}
      >
        {status.bars && (
          <span className="flex h-2.5 items-center gap-[2px]" aria-hidden>
            {[0, 120, 240].map((d) => (
              <span key={d} className="eq-bar h-2.5 w-[2px] rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />
            ))}
          </span>
        )}
        {status.label}
      </div>
    </section>
  );
}
