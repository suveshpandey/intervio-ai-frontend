'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { BlueprintPreview } from '@/components/blueprint-preview';
import { PageHeader } from '@/components/app/page-header';
import { ChevronRightIcon } from '@/components/icons';
import { useResume } from '@/lib/resumes';
import { useCreateBlueprint } from '@/lib/blueprints';
import { useStartInterview } from '@/lib/interviews';
import { ApiError } from '@/lib/api';
import type { BlueprintWithClaims, Difficulty, Level } from '@/lib/contracts';

const LEVELS: Level[] = ['junior', 'mid', 'senior'];
const DIFFICULTIES: Difficulty[] = ['easy', 'standard', 'hard'];

export default function ReviewPage() {
  const resumeId = useParams<{ id: string }>().id;
  const jdId = useSearchParams().get('jd') ?? undefined;

  const resume = useResume(resumeId);
  const router = useRouter();
  const create = useCreateBlueprint();
  const startInterview = useStartInterview();
  const [result, setResult] = useState<BlueprintWithClaims | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Smart defaults, seeded from the resume once it loads.
  const suggestedRole = resume.data?.resume.extracted?.experience?.[0]?.role ?? '';
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<Level>('mid');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [durationMin, setDurationMin] = useState(15);

  async function onGenerate() {
    setError(null);
    try {
      const res = await create.mutateAsync({
        resumeId,
        jdId,
        role: (role || suggestedRole || 'Software Engineer').trim(),
        level,
        difficulty,
        durationMin,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not build the plan. Try again.');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {result ? (
        <>
          <BlueprintPreview data={result} />
          <div className="mt-10 flex items-center gap-3 border-t border-border pt-8">
            <Button
              onClick={async () => {
                setError(null);
                try {
                  const res = await startInterview.mutateAsync(result.blueprint.id);
                  router.push(`/interview/${res.interviewId}`);
                } catch (err) {
                  setError(
                    err instanceof ApiError ? err.message : 'Could not start the interview.',
                  );
                }
              }}
              disabled={startInterview.isPending}
            >
              {startInterview.isPending ? 'Starting…' : 'Start interview'}
            </Button>
            <span className="text-sm text-muted-foreground">Typed for now — voice in Phase 4</span>
            <Link href={`/resumes/${result.blueprint.resumeId}`} className="ml-auto">
              <Button variant="ghost">Back to resume</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <PageHeader
            breadcrumb={
              <>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Dashboard
                </Link>
                <ChevronRightIcon className="h-3.5 w-3.5" />
                <Link
                  href={`/resumes/${resumeId}`}
                  className="transition-colors hover:text-foreground"
                >
                  Resume
                </Link>
                <ChevronRightIcon className="h-3.5 w-3.5" />
                <span className="text-foreground">Set up</span>
              </>
            }
            title="Set up the interview"
            description="We've pre-filled sensible defaults from your resume. Tweak anything, then generate the plan."
          />

          <div className="space-y-5">
              <Field label="Target role">
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder={suggestedRole || 'e.g. Full-Stack Engineer'}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <Field label="Level">
                  <Select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l[0].toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Difficulty">
                  <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>
                        {d[0].toUpperCase() + d.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Duration">
                  <Select value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}>
                    {[10, 15, 20, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <Button onClick={onGenerate} loading={create.isPending} className="mt-8 w-full sm:w-auto">
            {create.isPending ? 'Building your plan…' : 'Generate interview plan'}
          </Button>
        </>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
