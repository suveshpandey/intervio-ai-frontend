'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/app/page-header';
import { DashboardIcon, ChevronRightIcon } from '@/components/icons';
import { useSession } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import type { ParseStatus } from '@/lib/contracts';

const STATUS: Record<ParseStatus, { label: string; tone: 'default' | 'muted' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: 'Queued', tone: 'muted' },
  processing: { label: 'Analyzing', tone: 'warning' },
  done: { label: 'Ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export default function DashboardPage() {
  const { user } = useSession();
  const resumes = useResumes();
  const items = resumes.data?.resumes ?? [];

  return (
    <>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ''}.`}
        description="Upload a resume to see the claims worth defending, then run a live interview."
        actions={
          <Link href="/new">
            <Button>Analyze a resume</Button>
          </Link>
        }
      />

      {resumes.isLoading ? (
        <ul className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="edge-top grid place-items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary">
            <DashboardIcon className="h-5 w-5" />
          </span>
          <p className="font-medium">No resumes yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Upload your resume and we&apos;ll pull out the claims worth defending in an interview.
          </p>
          <Link href="/new" className="mt-5">
            <Button>Analyze a resume</Button>
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((r) => (
            <li key={r.id}>
              <Link
                href={`/resumes/${r.id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={STATUS[r.parseStatus].tone}>{STATUS[r.parseStatus].label}</Badge>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
