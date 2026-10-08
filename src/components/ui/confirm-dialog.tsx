'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Long enough to read as a fade, short enough not to feel sluggish. Matches duration-200. */
const EXIT_MS = 200;

/**
 * A blocking confirm for things that can't be undone. Deliberately plain: it
 * names what will be destroyed rather than asking "are you sure?".
 *
 * Fades and scales in, and out again on cancel — it stays mounted for the exit
 * animation and only then tells the parent to remove it.
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  icon,
  tone = 'destructive',
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** Shown in a tinted circle above the title. */
  icon?: React.ReactNode;
  /** `hangup` uses the solid call-end red; `destructive` the softer delete red. */
  tone?: 'destructive' | 'hangup';
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Mount hidden, then show on the next frame — that's what lets it fade IN.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /** Play the exit, then let the parent unmount. */
  const close = useCallback(() => {
    if (loading) return;
    setVisible(false);
    setTimeout(onCancel, EXIT_MS);
  }, [loading, onCancel]);

  // Escape cancels — never confirms.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={close}
      className={cn(
        'fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm',
        'transition-opacity duration-200 ease-out motion-reduce:transition-none',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'shadow-pop w-full max-w-md rounded-2xl border border-border bg-card p-7 sm:p-8',
          'transition-all duration-200 ease-out motion-reduce:transition-none',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-95 opacity-0',
        )}
      >
        {icon && (
          <span
            className={cn(
              'mb-5 grid h-12 w-12 place-items-center rounded-full',
              tone === 'hangup' ? 'bg-[var(--hangup)]/15 text-[var(--hangup)]' : 'bg-destructive/15 text-destructive',
            )}
          >
            {icon}
          </span>
        )}

        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">{body}</div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={close} disabled={loading} className="h-11 px-5">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className={cn(
              'h-11 px-5 text-white',
              tone === 'hangup'
                ? 'bg-[var(--hangup)] hover:bg-[var(--hangup-hover)]'
                : 'bg-destructive hover:bg-destructive/90',
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
