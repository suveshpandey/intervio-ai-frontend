'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * A blocking confirm for things that can't be undone. Deliberately plain: it
 * names what will be destroyed rather than asking "are you sure?".
 */
export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  loading,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Escape cancels — never confirms.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [loading, onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={() => !loading && onCancel()}
    >
      <div
        className="animate-pop shadow-pop w-full max-w-md rounded-2xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
