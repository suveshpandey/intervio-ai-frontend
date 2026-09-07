import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-transparent hover:bg-muted',
  ghost: 'bg-transparent hover:bg-muted',
};

export function Button({
  className,
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(
        'relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden rounded-[var(--radius)] px-4 text-sm font-medium',
        'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        // while loading the button stays fully opaque so the sweep reads clearly
        loading && 'disabled:opacity-100',
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 btn-sweep',
            variant !== 'primary' && 'btn-sweep-accent',
          )}
        />
      )}
      <span className={cn('relative inline-flex items-center gap-2', loading && 'opacity-80')}>
        {children}
      </span>
    </button>
  );
}
