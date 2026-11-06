'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth';
import { PageLoader } from '@/components/ui/page-loader';
import { MenuIcon } from '@/components/icons';
import { Sidebar } from '@/components/app/sidebar';
import { UserMenu } from '@/components/app/user-menu';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { Container } from '@/components/app/container';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  if (isLoading || !user) {
    return <PageLoader fullscreen label="Loading…" />;
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[18.5rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-card/30 md:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-border bg-card">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* Content column */}
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
            <Image src="/logo.png" alt="Intervio" width={24} height={24} />
            <span className="text-sm font-semibold tracking-tight">
              Intervio<span className="text-muted-foreground">.ai</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <main className="flex-1">
          {/* The dashboard is a grid of cards, so it gets more width than the reading pages. */}
          <Container className={pathname === '/dashboard' ? 'max-w-[68rem]' : undefined}>{children}</Container>
        </main>
      </div>
    </div>
  );
}
