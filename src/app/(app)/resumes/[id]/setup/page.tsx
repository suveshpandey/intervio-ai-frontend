'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { PageHeader } from '@/components/app/page-header';
import { InterviewSetup } from '@/components/interview-setup';
import { ChevronRightIcon } from '@/components/icons';
import { useResume } from '@/lib/resumes';

/** Step 2: pick the role, length and voice (pre-filled from last time), then start. */
export default function InterviewSetupPage() {
  const id = useParams<{ id: string }>().id;
  const jdId = useSearchParams().get('jd') ?? undefined;
  const { data, isLoading, error } = useResume(id);

  return (
    <div className="mx-auto max-w-2xl">
      {isLoading && <PageLoader label="Loading…" />}
      {error && (
        <p className="text-destructive">Couldn&apos;t load this resume.</p>
      )}

      {data && data.resume.parseStatus !== 'done' && (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This resume isn&apos;t ready yet.
          </p>
          <Link href={`/resumes/${id}`}>
            <Button variant="outline">Back to resume</Button>
          </Link>
        </div>
      )}

      {data && data.resume.parseStatus === 'done' && (
        <>
          <PageHeader
            breadcrumb={
              <>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <ChevronRightIcon className="h-3.5 w-3.5" />
                <Link
                  href={`/resumes/${id}`}
                  className="max-w-[12rem] truncate transition-colors hover:text-foreground"
                >
                  {data.resume.fileName}
                </Link>
                <ChevronRightIcon className="h-3.5 w-3.5" />
                <span className="text-foreground">Set up</span>
              </>
            }
            title="Set up your interview"
            description="Filled in from your last interview on this resume. Change anything, then start."
          />
          <InterviewSetup
            key={data.resume.targets.map((t) => t.role).join('|')}
            resumeId={id}
            saved={data.resume.targets}
            jdId={jdId}
          />
        </>
      )}
    </div>
  );
}
