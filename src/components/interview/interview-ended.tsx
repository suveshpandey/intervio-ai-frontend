'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Shown when the interview finishes — centred over the (dimmed) room, so the
 * moment reads as an ending rather than a card that slid in under the tiles.
 * The check draws itself left to right once the panel has faded in.
 */
export function InterviewEnded({ interviewId }: { interviewId: string }) {
  // Mount hidden, then show on the next frame so it fades in.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-ended-title"
      className={cn(
        'fixed inset-0 z-40 grid place-items-center bg-background/70 p-4 backdrop-blur-sm',
        'transition-opacity duration-300 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'shadow-pop w-full max-w-md rounded-2xl border border-border bg-card px-7 py-9 text-center sm:px-9',
          'transition-all duration-300 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
        )}
      >
        <span className="check-badge mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success ring-1 ring-success/30">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden>
            <path
              className="check-draw"
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <h2 id="interview-ended-title" className="mt-6 text-xl font-semibold tracking-tight">
          This interview has ended
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Your report is being put together now — it takes a few seconds.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href={`/interviews/${interviewId}?tab=report`}>
            <Button className="h-11 w-full px-5 sm:w-auto">See your report</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="h-11 w-full px-5 sm:w-auto">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
