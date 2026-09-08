'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, useLogout } from '@/lib/auth';
import { LogoutIcon } from '@/components/icons';

function initialsFrom(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = initialsFrom(user.name, user.email);

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-xs font-semibold tracking-wide text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initials}
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="edge-top absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/50"
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-sm font-medium">{user.name || 'Signed in'}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              disabled={logout.isPending}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
            >
              <LogoutIcon className="h-4 w-4" />
              {logout.isPending ? 'Logging out…' : 'Log out'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
