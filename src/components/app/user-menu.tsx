'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

const GAP = 8; // px below the trigger

export function UserMenu() {
  const router = useRouter();
  const { user } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Position the menu from the trigger's on-screen rect — independent of any
  // ancestor's backdrop-filter / sticky / transform (which break `absolute` anchoring).
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (r) setCoords({ top: r.bottom + GAP, right: window.innerWidth - r.right });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !menuRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!user) return null;

  const initials = initialsFrom(user.name, user.email);
  const firstName = firstNameFrom(user.name, user.email);

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/login');
  }

  return (
    <>
      {/* Capsule trigger: avatar + first name */}
      <button
        ref={triggerRef}
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

      {open &&
        coords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: coords.top, right: coords.right }}
            className="edge-top animate-pop shadow-pop z-[100] w-60 overflow-hidden rounded-xl border border-border bg-card p-1.5"
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
          </div>,
          document.body,
        )}
    </>
  );
}
