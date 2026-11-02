'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileIcon, TrashIcon } from '@/components/icons';
import { useDeleteResume } from '@/lib/resumes';
import { formatDay } from '@/components/dashboard/verdict';
import { cn } from '@/lib/utils';
import type { Resume } from '@/lib/contracts';

/** Status as quiet text, not a badge: the resume is the input, not the headline. */
function statusOf(r: Resume): { text: string; tone: 'ok' | 'busy' | 'bad' } {
  if (r.parseStatus === 'done') return { text: 'Ready', tone: 'ok' };
  if (r.parseStatus === 'failed') return { text: r.parseError?.split('.')[0] ?? 'Couldn’t read it', tone: 'bad' };
  return { text: 'Reading it…', tone: 'busy' };
}

function ResumeTile({ resume }: { resume: Resume }) {
  const [confirming, setConfirming] = useState(false);
  const del = useDeleteResume();
  const status = statusOf(resume);

  return (
    <li className="group relative">
      <Link
        href={`/resumes/${resume.id}`}
        className="flex h-full items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30"
      >
        <span
          className={cn(
            'grid h-9 w-9 shrink-0 place-items-center rounded-lg border',
            status.tone === 'bad'
              ? 'border-destructive/25 bg-destructive/10 text-destructive'
              : 'border-border bg-surface text-muted-foreground group-hover:text-primary',
          )}
        >
          <FileIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 pr-6">
          <span className="block truncate text-sm font-medium">{resume.fileName}</span>
          <span
            className={cn(
              'mt-0.5 block truncate text-xs',
              status.tone === 'bad' ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            {status.tone === 'ok' && (
              <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-success align-middle" />
            )}
            {status.text} · {formatDay(resume.createdAt)}
          </span>
        </span>
      </Link>

      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${resume.fileName}`}
        title="Delete resume"
        className="absolute right-2.5 top-2.5 rounded-md p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>

      {confirming && (
        <ConfirmDialog
          title={`Delete ${resume.fileName}?`}
          body="This removes the file, everything extracted from it, and every interview and report built on it. It can't be undone."
          confirmLabel="Delete resume"
          loading={del.isPending}
          error={del.error instanceof Error ? del.error.message : null}
          onCancel={() => setConfirming(false)}
          onConfirm={() => del.mutate(resume.id, { onSuccess: () => setConfirming(false) })}
        />
      )}
    </li>
  );
}

export function ResumeShelf({ resumes }: { resumes: Resume[] }) {
  if (resumes.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium">
          Resumes <span className="ml-1 font-mono text-xs text-muted-foreground">{resumes.length}</span>
        </h2>
        <Link href="/new" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Upload another
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {resumes.map((r) => (
          <ResumeTile key={r.id} resume={r} />
        ))}
      </ul>
    </section>
  );
}
