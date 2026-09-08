'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, useLogout } from '@/lib/auth';
import { LogoutIcon, UserIcon } from '@/components/icons';

function initialsFrom(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function firstNameFrom(name: string | null | undefined, email: string): string {
  if (name && name.trim()) return name.trim().split(/\s+/)[0];
  return email.split('@')[0];
}

export function UserMenu() {
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const initials = initialsFrom(user.name, user.email);
  const firstName = firstNameFrom(user.name, user.email);

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  return (
    <div className="relative">
      {/* Capsule trigger: avatar + first name */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-3 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold tracking-wide text-primary">
          {initials}
        </span>
        <span className="max-w-[8rem] truncate text-sm font-medium">{firstName}</span>
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
            className="edge-top animate-pop absolute right-1 top-full z-50 mt-7 w-60 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-2.5 px-2 py-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name || firstName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-border" />
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <UserIcon className="h-4 w-4" />
              Account
            </Link>
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
