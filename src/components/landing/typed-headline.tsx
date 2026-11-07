'use client';

import { useEffect, useState } from 'react';

const HOLD_MS = 2200;
const TYPE_MS = 55;
const DELETE_MS = 28;

/**
 * Types through a few endings for the headline. Renders the first phrase in full
 * (so it reads fine before JS and under reduced motion) and only then starts cycling.
 */
export function TypedHeadline({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let i = 0;
    let current = phrases[0];

    const wait = (ms: number) => new Promise<void>((r) => (timer = setTimeout(r, ms)));

    (async () => {
      while (!cancelled) {
        await wait(HOLD_MS);
        while (!cancelled && current.length > 0) {
          current = current.slice(0, -1);
          setText(current);
          await wait(DELETE_MS);
        }
        i = (i + 1) % phrases.length;
        setIndex(i);
        const next = phrases[i];
        for (let n = 1; !cancelled && n <= next.length; n++) {
          current = next.slice(0, n);
          setText(current);
          await wait(TYPE_MS);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases]);

  return (
    <span className="inline-block min-h-[1.05em]" aria-label={phrases[index]}>
      <span aria-hidden>{text}</span>
      <span aria-hidden className="blink ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-full bg-primary" />
    </span>
  );
}
