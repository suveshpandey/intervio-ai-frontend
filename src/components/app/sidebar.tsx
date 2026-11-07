'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  DashboardIcon,
  MicIcon,
  PlusIcon,
  ReportsIcon,
} from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useInterviews } from '@/lib/interviews';
import { accessFor, useNow } from '@/lib/interview-status';
import { useLastResume } from '@/lib/last-resume';
import { cn } from '@/lib/utils';
import type { InterviewSummary } from '@/lib/contracts';

type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => React.ReactNode;
};

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
  { href: '/new', label: 'New resume', icon: PlusIcon },
];

/** "2 Oct", or "Today" / "Yesterday" for the recent ones people actually look for. */
function whenLabel(iso: string): string {
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function statusDot(interview: InterviewSummary): string {
  if (interview.status === 'live' || interview.status === 'planned')
    return 'bg-success';
  if (interview.verdict === 'ready') return 'bg-success';
  if (interview.verdict === 'almost') return 'bg-warning';
  if (interview.verdict === 'not_ready') return 'bg-destructive';
  return 'bg-muted-foreground/40';
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useSession();
  // The server enforces this; hiding the link just avoids sending people at a 403.
  const last = useLastResume();
  // One click from anywhere to the setup page for the resume you used last.
  const base: NavItem[] = last
    ? [
        NAV[0]!,
        { href: last.href, label: 'Start interview', icon: MicIcon },
        ...NAV.slice(1),
      ]
    : NAV;
  const nav = user?.isAdmin
    ? [...base, { href: '/admin', label: 'Usage & spend', icon: ReportsIcon }]
    : base;

  return (
    <div className="flex h-full flex-col p-4">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-8 flex items-center gap-2.5 px-2 py-1"
      >
        <Image src="/logo.png" alt="Intervio" width={38} height={38} priority />
        <span className="text-[20px] font-semibold tracking-tight">
          Intervio<span className="text-muted-foreground">.ai</span>
        </span>
      </Link>

      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
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
              <Icon
                className={cn('h-[18px] w-[18px]', active && 'text-primary')}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <hr className="mt-5 border-t border-border" />
      <div className="mb-2 mt-4 px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/50">
        Interviews
      </div>
      <InterviewHistory pathname={pathname} onNavigate={onNavigate} />

      <div className="mt-auto px-3 pt-3 font-mono text-[11px] text-muted-foreground/40">
        Intervio · MVP
      </div>
    </div>
  );
}

/** Past interviews, newest first. Each one opens its transcript and report. */
function InterviewHistory({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { data, isLoading } = useInterviews();
  const interviews = data?.interviews ?? [];
  const now = useNow();

  if (isLoading) {
    return (
      <div className="space-y-1.5 px-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-7 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <p className="px-3 text-xs leading-relaxed text-muted-foreground/60">
        Your interviews will appear here once you&apos;ve run one.
      </p>
    );
  }

  return (
    <nav className="-mr-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
      {interviews.map((interview) => {
        const access = accessFor(interview, now);
        const active =
          pathname === `/interviews/${interview.id}` ||
          pathname === `/interview/${interview.id}`;
        return (
          <Link
            key={interview.id}
            href={access.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            title={`${interview.role} · ${access.open ? access.detail : whenLabel(interview.createdAt)}`}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
              active
                ? 'bg-primary/10 font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                statusDot(interview),
                access.open && 'live-dot',
              )}
            />
            <span className="truncate">{interview.role}</span>
            {access.open ? (
              <span className="ml-auto shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success">
                {access.short}
              </span>
            ) : interview.status === 'not_started' ? (
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/60">
                Not started
              </span>
            ) : (
              <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/60">
                {whenLabel(interview.createdAt)}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
