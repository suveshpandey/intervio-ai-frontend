'use client';

import Link from 'next/link';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/lib/auth';
import { useResumes } from '@/lib/resumes';
import type { ParseStatus } from '@/lib/contracts';

const STATUS: Record<ParseStatus, { label: string; tone: 'default' | 'muted' | 'success' | 'warning' | 'destructive' }> = {
  pending: { label: 'Queued', tone: 'muted' },
  processing: { label: 'Analyzing', tone: 'warning' },
  done: { label: 'Ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export default function DashboardPage() {
  const { user, isLoading } = useRequireAuth();
  const resumes = useResumes();

  if (isLoading || !user) {
    return <PageLoader fullscreen label="Loading your dashboard…" />;
  }

  const items = resumes.data?.resumes ?? [];

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome{user.name ? `, ${user.name}` : ''}.
            </h1>
            <p className="mt-2 text-muted-foreground">Upload a resume to see the claims worth defending.</p>
          </div>
          <Link href="/new">
            <Button>Analyze a resume</Button>
          </Link>
        </div>

        {resumes.isLoading ? (
          <ul className="mt-10 divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border">
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
          <div className="mt-10 grid place-items-center rounded-[var(--radius)] border border-dashed border-border py-20 text-center">
            <p className="text-sm text-muted-foreground">No resumes yet.</p>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border">
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
                  <Badge tone={STATUS[r.parseStatus].tone}>{STATUS[r.parseStatus].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
