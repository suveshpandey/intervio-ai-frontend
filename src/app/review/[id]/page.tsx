'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { BlueprintPreview } from '@/components/blueprint-preview';
import { useRequireAuth } from '@/lib/auth';
import { useResume } from '@/lib/resumes';
import { useCreateBlueprint } from '@/lib/blueprints';
import { ApiError } from '@/lib/api';
import type { BlueprintWithClaims, Difficulty, Level } from '@/lib/contracts';

const LEVELS: Level[] = ['junior', 'mid', 'senior'];
const DIFFICULTIES: Difficulty[] = ['easy', 'standard', 'hard'];

export default function ReviewPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const resumeId = useParams<{ id: string }>().id;
  const jdId = useSearchParams().get('jd') ?? undefined;

  const resume = useResume(resumeId);
  const create = useCreateBlueprint();
  const [result, setResult] = useState<BlueprintWithClaims | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Smart defaults, seeded from the resume once it loads.
  const suggestedRole = resume.data?.resume.extracted?.experience?.[0]?.role ?? '';
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<Level>('mid');
  const [difficulty, setDifficulty] = useState<Difficulty>('standard');
  const [durationMin, setDurationMin] = useState(15);

  if (authLoading || !user) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Loading…</main>;
  }

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
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        {result ? (
          <>
            <BlueprintPreview data={result} />
            <div className="mt-10 flex items-center gap-3 border-t border-border pt-8">
              <Button disabled title="The live voice interview arrives in the next phase">
                Start interview
              </Button>
              <span className="text-sm text-muted-foreground">Voice interview — coming next phase</span>
              <Link href={`/resumes/${result.blueprint.resumeId}`} className="ml-auto">
                <Button variant="ghost">Back to resume</Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">Set up the interview</h1>
            <p className="mt-2 text-muted-foreground">
              We&apos;ve pre-filled sensible defaults from your resume. Tweak anything, then generate the plan.
            </p>

            <div className="mt-8 space-y-5">
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

            <Button onClick={onGenerate} disabled={create.isPending} className="mt-8 w-full sm:w-auto">
              {create.isPending ? (
                <>
                  <Spinner /> Building your plan…
                </>
              ) : (
                'Generate interview plan'
              )}
            </Button>
          </>
        )}
      </main>
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
