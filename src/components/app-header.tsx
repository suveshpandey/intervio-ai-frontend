'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useSession, useLogout } from '@/lib/auth';

/** Shared top bar for authenticated pages: brand → dashboard, user email, logout. */
export function AppHeader() {
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <Link href="/dashboard" className="font-semibold tracking-tight">
        Intervio
      </Link>
      <div className="flex items-center gap-4">
        {user && <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>}
        <Button variant="outline" onClick={onLogout} disabled={logout.isPending}>
          Log out
        </Button>
      </div>
    </header>
  );
}
