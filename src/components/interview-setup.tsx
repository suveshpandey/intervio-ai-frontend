'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { VoicePicker } from '@/components/voice-picker';
import { useSaveTarget } from '@/lib/resumes';
import { useStartInterview, useInterviews } from '@/lib/interviews';
import { useVoices } from '@/lib/voices';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Difficulty, InterviewTarget, Level } from '@/lib/contracts';

const LEVELS: Level[] = ['junior', 'mid', 'senior'];
const DIFFICULTIES: Difficulty[] = ['easy', 'standard', 'hard'];
const DURATIONS = [10, 15, 20, 30];

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/**
 * Set the target once, then start with one click. The target is saved on the
 * resume, so every later interview is a single button. The plan is built when
 * the interview starts; "What we'll cover" is an optional look beforehand.
 */
export function InterviewSetup({
  resumeId,
  saved,
  jdId,
}: {
  resumeId: string;
  /** Saved roles, most recently used first (never empty). */
  saved: InterviewTarget[];
  jdId?: string;
}) {
  const router = useRouter();
  const voices = useVoices();
  const save = useSaveTarget(resumeId);
  const start = useStartInterview();
  const interviews = useInterviews();

  const last = saved[0]!;
  const [role, setRole] = useState(last.role);
  const [level, setLevel] = useState<Level>(last.level);
  const [difficulty, setDifficulty] = useState<Difficulty>(last.difficulty);
  const [durationMin, setDurationMin] = useState(last.durationMin);
  const [voice, setVoice] = useState(last.voice);
  // A job description that came with the upload belongs to the role being set up now.
  const [jd, setJd] = useState<string | undefined>(jdId ?? last.jdId);
  const [error, setError] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const target = (): InterviewTarget => ({
    role: role.trim() || last.role,
    level,
    difficulty,
    durationMin,
    voice,
    jdId: jd,
  });

  const isSaved = (t: InterviewTarget) =>
    t.role.trim().toLowerCase() === role.trim().toLowerCase();

  /** Switch to a role you've used before: its own level, length, voice and JD come with it. */
  function pickRole(t: InterviewTarget) {
    setRole(t.role);
    setLevel(t.level);
    setDifficulty(t.difficulty);
    setDurationMin(t.durationMin);
    setVoice(t.voice);
    setJd(t.jdId);
    setEditing(false);
  }

  /** A fresh role starts from the same settings with the role (and JD) cleared. */
  function newRole() {
    setRole('');
    setJd(undefined);
    setEditing(true);
  }

  /** Save the target if it changed (or a JD came with the upload), then go. */
  async function persist(): Promise<boolean> {
    setError(null);
    setRunningId(null);
    if (!role.trim()) {
      setError('Type the role you’re interviewing for.');
      return false;
    }
    try {
      await save.mutateAsync(target());
      return true;
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not save your setup.',
      );
      return false;
    }
  }

  async function onStart() {
    if (!(await persist())) return;
    try {
      const res = await start.mutateAsync({ resumeId });
      router.push(`/interview/${res.interviewId}`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not start the interview.',
      );
      if (err instanceof ApiError && err.code === 'interview_in_progress') {
        const fresh = await interviews.refetch();
        setRunningId(
          fresh.data?.interviews.find((i) => i.status === 'live')?.id ?? null,
        );
      }
    }
  }

  async function onPreview() {
    if (await persist()) router.push(`/review/${resumeId}`);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
            Your interview
          </p>
          <p className="mt-2 text-lg font-medium tracking-tight">
            {target().role} · {cap(level)} · {durationMin} min
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Remembered per role, so every interview is one click. Switch role
            any time; we pick the claims worth checking.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="shrink-0 text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      </div>

      <div
        className="mt-5 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Role to interview for"
      >
        {saved.map((t) => (
          <Chip key={t.role} active={isSaved(t)} onClick={() => pickRole(t)}>
            {t.role}
          </Chip>
        ))}
        <Chip active={!saved.some(isSaved)} onClick={newRole}>
          + New role
        </Chip>
      </div>

      {editing && (
        <div className="mt-5 space-y-5 border-t border-border pt-5">
          <Field label="Target role">
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Full-Stack Engineer"
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Level">
              <Select
                value={level}
                onChange={(e) => setLevel(e.target.value as Level)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {cap(l)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Difficulty">
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {cap(d)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Duration">
              <Select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
              >
                {DURATIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} min
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Interviewer voice" group>
            {voices.data ? (
              <VoicePicker
                voices={voices.data.voices}
                value={voice}
                onChange={setVoice}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Loading voices…</p>
            )}
          </Field>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button onClick={onStart} loading={start.isPending || save.isPending}>
          {start.isPending ? 'Starting…' : 'Start interview'}
        </Button>
        <Button
          variant="outline"
          onClick={onPreview}
          disabled={start.isPending || save.isPending}
        >
          What we&apos;ll cover
        </Button>
        <span className="text-sm text-muted-foreground">
          The interviewer speaks — turn your sound on
        </span>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive">
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
      )}
    </section>
  );
}

/**
 * A labelled field. `group` renders a div instead of a <label>: a <label> forwards
 * every click inside it to its first button, which for the voice picker meant
 * choosing one voice pressed the first voice's Preview.
 */
function Field({
  label,
  children,
  group = false,
}: {
  label: string;
  children: React.ReactNode;
  group?: boolean;
}) {
  const Tag = group ? 'div' : 'label';
  return (
    <Tag className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </Tag>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-sm transition-colors',
        active
          ? 'border-primary/50 bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
