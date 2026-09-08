import { cn } from '@/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

export function Input({ className, icon, trailing, ...props }: InputProps) {
  const base = cn(
    'flex h-10 w-full rounded-[var(--radius)] border border-input bg-transparent px-3 text-sm',
    'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
  );

  if (!icon && !trailing) {
    return <input className={cn(base, className)} {...props} />;
  }

  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
          {icon}
        </span>
      )}
      <input className={cn(base, icon && 'pl-9', trailing && 'pr-10', className)} {...props} />
      {trailing && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2">{trailing}</span>
      )}
    </div>
  );
}
