'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { DashboardIcon, PlusIcon, InterviewsIcon, ReportsIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/new', label: 'New interview', icon: PlusIcon },
];

const SOON: { label: string; icon: (p: { className?: string }) => React.ReactNode }[] = [
  { label: 'Interviews', icon: InterviewsIcon },
  { label: 'Reports', icon: ReportsIcon },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col p-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-8 flex items-center gap-2.5 px-2 py-1"
      >
        <Image src="/logo.png" alt="Intervio" width={28} height={28} priority />
        <span className="text-[15px] font-semibold tracking-tight">
          Intervio<span className="text-muted-foreground">.ai</span>
        </span>
      </Link>

      <nav className="space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px]', active && 'text-primary')} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mb-2 mt-7 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/50">
        Soon
      </div>
      <div className="space-y-1">
        {SOON.map(({ label, icon: Icon }) => (
          <div
            key={label}
            aria-disabled
            className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/45"
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </div>
        ))}
      </div>

      <div className="mt-auto px-3 pt-6 font-mono text-[11px] text-muted-foreground/40">
        Intervio · MVP
      </div>
    </div>
  );
}
