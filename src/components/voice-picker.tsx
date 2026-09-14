'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { VoiceOption } from '@/lib/contracts';

/**
 * Pick the interviewer's voice, with a preview.
 *
 * Previewing matters here: you listen to this voice for 15 minutes, and choosing
 * one blind is a bad experience. The clips are Deepgram-hosted, so previewing
 * costs nothing and is instant.
 */
export function VoicePicker({
  voices,
  value,
  onChange,
}: {
  voices: VoiceOption[];
  value: string;
  onChange: (id: string) => void;
}) {
  const [playing, setPlaying] = useState<string | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  // Never leave a clip playing after the user navigates away.
  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  function preview(voice: VoiceOption) {
    audio.current?.pause();
    if (playing === voice.id) {
      setPlaying(null);
      return;
    }
    const el = new Audio(voice.sampleUrl);
    el.onended = () => setPlaying(null);
    el.onerror = () => setPlaying(null);
    audio.current = el;
    setPlaying(voice.id);
    void el.play().catch(() => setPlaying(null));
  }

  return (
    <div role="radiogroup" aria-label="Interviewer voice" className="grid gap-3 sm:grid-cols-3">
      {voices.map((v) => {
        const selected = v.id === value;
        const isPlaying = playing === v.id;
        return (
          <div
            key={v.id}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => onChange(v.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(v.id);
              }
            }}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected
                ? 'border-primary/60 bg-primary/[0.06] shadow-[0_0_0_1px_var(--primary)]'
                : 'border-border hover:border-primary/30 hover:bg-surface',
            )}
          >
            {/* Selected tick */}
            <span
              aria-hidden
              className={cn(
                'absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full transition-all',
                selected ? 'scale-100 bg-primary text-primary-foreground' : 'scale-0',
              )}
            >
              <CheckIcon />
            </span>

            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors',
                  selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {v.name[0]}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium leading-tight">{v.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                  {v.accent}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">{v.description}</p>

            <button
              type="button"
              aria-label={isPlaying ? `Stop ${v.name}` : `Preview ${v.name}`}
              onClick={(e) => {
                e.stopPropagation();
                preview(v);
              }}
              className={cn(
                'mt-3 flex w-full items-center justify-center gap-2 rounded-lg border py-1.5',
                'text-xs font-medium transition-colors',
                isPlaying
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground',
              )}
            >
              {isPlaying ? (
                <>
                  <Equalizer />
                  Playing
                </>
              ) : (
                <>
                  <PlayIcon />
                  Preview
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}

/** Live bars while the sample plays — same motion language as the landing page. */
function Equalizer() {
  return (
    <span className="flex h-3 items-center gap-[2px]" aria-hidden>
      {[0, 120, 240, 360].map((delay) => (
        <span
          key={delay}
          className="eq-bar h-3 w-[2px] rounded-full bg-primary"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M3 1.5v9l7-4.5-7-4.5Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 6.2l2.3 2.3L9.5 3.8" />
    </svg>
  );
}
