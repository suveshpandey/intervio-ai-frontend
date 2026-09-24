'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FileIcon, ChevronRightIcon, TrashIcon, InterviewsIcon } from '@/components/icons';
import { useDeleteResume } from '@/lib/resumes';
import { cn } from '@/lib/utils';
import type { InterviewSummary, ParseStatus, Resume, Verdict } from '@/lib/contracts';

const STATUS: Record<
  ParseStatus,
  { label: string; tone: 'default' | 'muted' | 'success' | 'warning' | 'destructive' }
> = {
  pending: { label: 'Queued', tone: 'muted' },
  processing: { label: 'Analyzing', tone: 'warning' },
  done: { label: 'Ready', tone: 'success' },
  failed: { label: 'Failed', tone: 'destructive' },
};

export const VERDICTS: Record<Verdict, { label: string; tone: 'success' | 'warning' | 'destructive' }> = {
  ready: { label: 'Ready', tone: 'success' },
  almost: { label: 'Almost', tone: 'warning' },
  not_ready: { label: 'Not ready', tone: 'destructive' },
};

type Tone = 'neutral' | 'success' | 'warning' | 'destructive';

/**
 * One list row. The <li> is the hover surface — with the link and the delete
 * button as siblings, hovering used to light up only part of the row.
 */
function RowShell({ children }: { children: React.ReactNode }) {
  return (
    <li className="group relative flex items-stretch border-b border-border transition-colors last:border-0 hover:bg-muted/50">
      {/* A hairline that grows in from the left: movement on hover, no colour wash. */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary/70 transition-transform duration-200 group-hover:scale-y-100"
      />
      {children}
    </li>
  );
}

function Tile({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-colors',
        tone === 'neutral' &&
          'border-border bg-surface text-muted-foreground group-hover:border-primary/30 group-hover:text-primary',
        tone === 'success' && 'border-success/25 bg-success/10 text-success',
        tone === 'warning' && 'border-warning/25 bg-warning/10 text-warning',
        tone === 'destructive' && 'border-destructive/25 bg-destructive/10 text-destructive',
      )}
    >
      {children}
    </span>
  );
}

const Chevron = () => (
  <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground/25 transition-all group-hover:translate-x-0.5 group-hover:text-foreground/60" />
);

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function ResumeRow({ resume }: { resume: Resume }) {
  const meta = STATUS[resume.parseStatus];
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteResume = useDeleteResume();
  const failed = resume.parseStatus === 'failed';

  return (
    <RowShell>
      <Link href={`/resumes/${resume.id}`} className="flex min-w-0 flex-1 items-center gap-3.5 py-4 pl-5 pr-3">
        <Tile tone={failed ? 'destructive' : 'neutral'}>
          <FileIcon className="h-[18px] w-[18px]" />
        </Tile>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium leading-tight">{resume.fileName}</p>
          <p className={cn('mt-1 truncate text-xs', failed ? 'text-destructive/80' : 'text-muted-foreground')}>
            {/* A failed row should say what went wrong, not just when it was uploaded. */}
            {failed && resume.parseError ? resume.parseError.split('.')[0] : shortDate(resume.createdAt)}
          </p>
        </div>

        <Badge tone={meta.tone}>{meta.label}</Badge>
      </Link>

      <div className="flex shrink-0 items-center gap-1 pr-4">
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete ${resume.fileName}`}
          title="Delete resume"
          className="rounded-lg p-2 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
        <Chevron />
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title={`Delete ${resume.fileName}?`}
          body="This removes the file, everything extracted from it, and every interview and report built on it. It can't be undone."
          confirmLabel="Delete resume"
          loading={deleteResume.isPending}
          error={deleteResume.error instanceof Error ? deleteResume.error.message : null}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => deleteResume.mutate(resume.id, { onSuccess: () => setConfirmDelete(false) })}
        />
      )}
    </RowShell>
  );
}

export function InterviewRow({ interview }: { interview: InterviewSummary }) {
  const verdict = interview.verdict ? VERDICTS[interview.verdict] : null;
  const live = interview.status === 'live';

  return (
    <RowShell>
      <Link
        href={`/interviews/${interview.id}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 py-4 pl-5 pr-4"
      >
        <Tile tone={verdict?.tone ?? 'neutral'}>
          {live ? (
            <span className="live-dot h-2 w-2 rounded-full bg-success" aria-hidden />
          ) : (
            <InterviewsIcon className="h-[18px] w-[18px]" />
          )}
        </Tile>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium leading-tight">{interview.role}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {shortDate(interview.createdAt)}
            {interview.claims
              ? ` · ${interview.claims.claimsSupported}/${interview.claims.claimsProbed} claims backed up`
              : live
                ? ' · in progress'
                : ` · ${interview.turnCount} question${interview.turnCount === 1 ? '' : 's'}`}
          </p>
        </div>

        {verdict ? (
          <Badge tone={verdict.tone}>{verdict.label}</Badge>
        ) : (
          <Badge tone="muted">{live ? 'Running' : 'No report'}</Badge>
        )}
        <Chevron />
      </Link>
    </RowShell>
  );
}
