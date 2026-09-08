import { cn } from '@/lib/utils';

/** Consistent page title block: optional breadcrumb, title, description, actions. */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-9', className)}>
      {breadcrumb && (
        <div className="mb-3 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          {breadcrumb}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
