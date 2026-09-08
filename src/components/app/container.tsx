import { cn } from '@/lib/utils';

/** One content width + padding for every app page, so gutters never jump. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('mx-auto w-full max-w-4xl px-6 py-10', className)}>{children}</div>;
}
