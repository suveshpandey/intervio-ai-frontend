'use client';

import { createContext, useContext, useEffect, useState, Fragment } from 'react';
import Link from 'next/link';
import { ChevronRightIcon } from '@/components/icons';

export type Crumb = { label: string; href?: string };

type Ctx = { items: Crumb[]; setItems: (items: Crumb[]) => void };

const BreadcrumbCtx = createContext<Ctx | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Crumb[]>([]);
  return <BreadcrumbCtx.Provider value={{ items, setItems }}>{children}</BreadcrumbCtx.Provider>;
}

/** Declare the current page's breadcrumb trail. Cleared automatically on unmount. */
export function useBreadcrumbs(items: Crumb[]) {
  const ctx = useContext(BreadcrumbCtx);
  const set = ctx?.setItems;
  const key = JSON.stringify(items);
  useEffect(() => {
    set?.(items);
    return () => set?.([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, set]);
}

/** The breadcrumb bar under the top nav — hidden when no trail is set (e.g. dashboard). */
export function BreadcrumbBar() {
  const ctx = useContext(BreadcrumbCtx);
  const items = ctx?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="border-b border-border">
      <nav className="mx-auto flex max-w-4xl items-center gap-1.5 px-6 py-3.5 font-mono text-xs text-muted-foreground">
        {items.map((c, i) => (
          <Fragment key={`${c.label}-${i}`}>
            {i > 0 && <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground/50" />}
            {c.href ? (
              <Link href={c.href} className="transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="max-w-[16rem] truncate text-foreground">{c.label}</span>
            )}
          </Fragment>
        ))}
      </nav>
    </div>
  );
}
