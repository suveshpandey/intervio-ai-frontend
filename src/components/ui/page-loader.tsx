import { cn } from '@/lib/utils';

/**
 * Full-height page/section loader — a label above a dashed rule whose dashes
 * march left → right. Our house loading style (never a bare circular spinner).
 */
export function PageLoader({
  label = 'Loading…',
  fullscreen = false,
  className,
}: {
  label?: string;
  fullscreen?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'grid place-items-center',
        fullscreen ? 'min-h-dvh' : 'min-h-[55vh]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="dash-line" aria-hidden />
      </div>
    </div>
  );
}
