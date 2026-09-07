import { cn } from '@/lib/utils';

/**
 * Shimmering placeholder block. Compose these into skeletons that mirror the
 * real content's layout (rows, cards, text lines) while data loads.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('skeleton rounded-[var(--radius)]', className)}
    />
  );
}
