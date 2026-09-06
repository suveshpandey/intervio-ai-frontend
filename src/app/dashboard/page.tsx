'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession, useLogout } from '@/lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useSession();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Loading…</main>;
  }

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  return (
    <div className="min-h-dvh">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-semibold tracking-tight">Intervio</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <Button variant="outline" onClick={onLogout} disabled={logout.isPending}>
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome{user.name ? `, ${user.name}` : ''}.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your interviews will show up here. Nothing yet — the upload flow arrives next.
        </p>

        <div className="mt-10 grid place-items-center rounded-[var(--radius)] border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">No interviews yet.</p>
        </div>
      </main>
    </div>
  );
}
