'use client';

import { useEffect, useRef, useState } from 'react';
import { useVoices } from '@/lib/voices';
import { cn } from '@/lib/utils';

/**
 * Hear the interviewer before signing up.
 *
 * It is a voice product; describing the voice is weaker than playing it. Uses
 * the same catalogue the interview config screen uses, so this can never drift
 * from the voices we actually ship. If the API is unreachable the section simply
 * doesn't render — a landing page must not depend on the backend being up.
 */
export function VoicePreview() {
  const { data } = useVoices();
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const voices = data?.voices ?? [];
  if (voices.length === 0) return null;

  function toggle(id: string, url: string) {
    audioRef.current?.pause();

    if (playing === id) {
      setPlaying(null);
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => setPlaying(null);
    audio.onerror = () => setPlaying(null);
    audioRef.current = audio;
    void audio.play().catch(() => setPlaying(null));
    setPlaying(id);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {voices.map((voice) => {
        const active = playing === voice.id;
        return (
          <button
            key={voice.id}
            type="button"
            onClick={() => toggle(voice.id, voice.sampleUrl)}
            aria-pressed={active}
            className={cn(
              'group flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all',
              active
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-card hover:border-primary/30 hover:bg-muted/40',
            )}
          >
            <span
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors',
                active
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-border bg-surface text-muted-foreground group-hover:text-primary',
              )}
            >
              {active ? (
                // Equalizer while it speaks — the same motion the live room uses.
                <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                  {[0, 120, 240].map((d) => (
                    <span
                      key={d}
                      className="eq-bar w-[3px] rounded-full bg-primary"
                      style={{ height: 14, animationDelay: `${d}ms` }}
                    />
                  ))}
                </span>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-[1px]" aria-hidden>
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
                </svg>
              )}
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-medium">{voice.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {active ? 'Playing…' : voice.accent}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
