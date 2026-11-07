'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BlueprintPreview } from '@/components/blueprint-preview';
import { PageLoader } from '@/components/ui/page-loader';
import { useResume } from '@/lib/resumes';
import { useCreateBlueprint } from '@/lib/blueprints';
import { useStartInterview, useInterviews } from '@/lib/interviews';
import { ApiError } from '@/lib/api';
import type { BlueprintWithClaims } from '@/lib/contracts';

/**
 * "What we'll cover": an optional look at the plan before starting. The plan is
 * built from the resume's saved target (change it on the resume page), so
 * there is nothing to fill in here.
 */
export default function PlanPreviewPage() {
  const resumeId = useParams<{ id: string }>().id;
  const router = useRouter();
  const resume = useResume(resumeId);
  const create = useCreateBlueprint();
  const start = useStartInterview();
  const interviews = useInterviews();

  const [plan, setPlan] = useState<BlueprintWithClaims | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const requested = useRef(false);

  const target = resume.data?.resume.targets[0];
  useEffect(() => {
    if (!target || requested.current) return;
    requested.current = true;
    create
      .mutateAsync({ resumeId, ...target })
      .then(setPlan)
      .catch((err: unknown) =>
        setError(
          err instanceof ApiError
            ? err.message
            : 'Could not build the plan. Try again.',
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, resumeId]);

  async function onStart() {
    if (!plan) return;
    setError(null);
    setRunningId(null);
    try {
      const res = await start.mutateAsync({ blueprintId: plan.blueprint.id });
      router.push(`/interview/${res.interviewId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not start the interview.',
      );
      // Only one interview may run at a time — point them at the one that is.
      if (err instanceof ApiError && err.code === 'interview_in_progress') {
        const fresh = await interviews.refetch();
        setRunningId(
          fresh.data?.interviews.find(
            (i) => i.status === 'live' || i.status === 'planned',
          )?.id ?? null,
        );
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {!plan && !error && <PageLoader label="Putting the plan together…" />}

      {plan && (
        <>
          <BlueprintPreview data={plan} />
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-8">
            <Button onClick={onStart} loading={start.isPending}>
              {start.isPending ? 'Starting…' : 'Start interview'}
            </Button>
            <span className="text-sm text-muted-foreground">
              The interviewer speaks — turn your sound on
            </span>
            <Link href={`/resumes/${resumeId}/setup`} className="ml-auto">
              <Button variant="ghost">Change setup</Button>
            </Link>
          </div>
        </>
      )}

      {error && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-destructive">
            {error}{' '}
            {runningId && (
              <Link
                href={`/interview/${runningId}`}
                className="underline underline-offset-2"
              >
                Go to it
              </Link>
            )}
          </p>
          {!plan && (
            <Link href={`/resumes/${resumeId}`}>
              <Button variant="outline">Back to resume</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
