'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/page-loader';
import { ChevronRightIcon } from '@/components/icons';
import { useResume, useJd } from '@/lib/resumes';
import type { Claim, ExtractedResume, ProjectItem } from '@/lib/contracts';

export default function ResumeResultPage() {
  const params = useParams<{ id: string }>();
  const jdId = useSearchParams().get('jd');

  const { data, isLoading, error } = useResume(params.id);
  const jd = useJd(jdId);

  return (
    <div className="mx-auto max-w-3xl">
      {isLoading && <PageLoader label="Loading resume…" />}
      {error && (
        <StateNote tone="error">Couldn&apos;t load this resume.</StateNote>
      )}

      {data &&
        (() => {
          const { resume, claims } = data;
          const status = resume.parseStatus;

          if (status === 'pending' || status === 'processing')
            return <Analyzing name={resume.fileName} />;
          if (status === 'failed') return <Failed error={resume.parseError} />;

          const extracted = resume.extracted;
          return (
            <div className="space-y-8">
              <header>
                <div className="mb-4 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Link
                    href="/dashboard"
                    className="transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  <span className="truncate text-foreground">
                    {resume.fileName}
                  </span>
                </div>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Here&apos;s what we found
                    </h1>
                    {extracted?.summary && (
                      <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {extracted.summary}
                      </p>
                    )}
                  </div>
                </div>
              </header>

              {jd.data && jd.data.jd.requiredSkills.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Target role · required skills
                  </p>
                  <ChipList items={jd.data.jd.requiredSkills} />
                </div>
              )}

              <ResumeTabs claims={claims} extracted={extracted} />

              {/* Pinned to the bottom of the screen while the tab content scrolls above it. */}
              <div className="sticky bottom-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/90 px-6 py-4 backdrop-blur-xl">
                <p className="text-sm text-muted-foreground">
                  Next: pick the role, length and voice.
                </p>
                <SetupCta resumeId={resume.id} jdId={jdId} />
              </div>
            </div>
          );
        })()}
    </div>
  );
}

/* ── States ── */

function Analyzing({ name }: { name: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="flex flex-col items-center gap-5">
        <div>
          <p className="font-medium">Analyzing {name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reading your resume and extracting claims — this takes a few
            seconds.
          </p>
        </div>
        <span className="dash-line" aria-hidden />
      </div>
    </div>
  );
}

const TIPS = [
  'A PDF or DOCX, up to 5 MB',
  'Real text, not a scan or a photo',
  'Your experience, skills and projects',
];

function Failed({ error }: { error: string | null }) {
  // A file we couldn't read and a file that isn't a resume are different problems.
  const notAResume = error?.includes("doesn't look like a resume") ?? false;
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="rise flex w-full max-w-sm flex-col items-center text-center">
        <CrossMark />

        <h1 className="mt-7 text-xl font-semibold tracking-tight">
          {notAResume
            ? "That doesn't look like a resume"
            : "We couldn't read that file"}
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          {notAResume
            ? "We couldn't find the experience, skills or projects of a CV in it, so there's nothing to build an interview from."
            : (error ?? 'The file may be scanned, image-only, or corrupted.')}
        </p>

        <ul className="mt-7 w-full space-y-2.5 rounded-xl border border-border bg-card px-5 py-4 text-left">
          <li className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            What works
          </li>
          {TIPS.map((tip) => (
            <li key={tip} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ background: 'var(--primary)' }}
              />
              {tip}
            </li>
          ))}
        </ul>

        <Link href="/new" className="mt-8">
          <Button className="h-11 px-6">Try another file</Button>
        </Link>
      </div>
    </div>
  );
}

/** A solid red disc; the cross is wiped in once, left to right. */
function CrossMark() {
  return (
    <span
      aria-hidden
      className="grid h-16 w-16 place-items-center rounded-full"
      style={{ background: 'var(--destructive)' }}
    >
      <svg viewBox="0 0 24 24" className="cross-reveal h-8 w-8" fill="none">
        <path
          d="M7 7l10 10M17 7 7 17"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function StateNote({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: 'error';
}) {
  return (
    <p
      className={
        tone === 'error' ? 'text-destructive' : 'text-muted-foreground'
      }
    >
      {children}
    </p>
  );
}

/* ── Next step ── */

function SetupCta({
  resumeId,
  jdId,
}: {
  resumeId: string;
  jdId: string | null;
}) {
  return (
    <Link
      href={`/resumes/${resumeId}/setup${jdId ? `?jd=${jdId}` : ''}`}
      className="shrink-0"
    >
      <Button className="h-11 w-full px-5 text-[15px] sm:w-auto">
        Set interview configuration
      </Button>
    </Link>
  );
}

type TabKey = 'experience' | 'projects' | 'skills' | 'claims';

/**
 * The resume in four tabs, so the page is short and calm. Claims are optional
 * reading: they only open when the user asks for them.
 */
function ResumeTabs({
  claims,
  extracted,
}: {
  claims: Claim[];
  extracted: ExtractedResume | null;
}) {
  const experience = extracted?.experience ?? [];
  const projects = extracted?.projects ?? [];
  const skills = extracted?.skills ?? [];

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'experience', label: 'Experience', count: experience.length },
    { key: 'projects', label: 'Projects', count: projects.length },
    { key: 'skills', label: 'Skills', count: skills.length },
    { key: 'claims', label: 'Claims to defend', count: claims.length },
  ];
  const first = tabs.find((t) => t.key !== 'claims' && t.count > 0)?.key;
  const [tab, setTab] = useState<TabKey>(first ?? 'claims');

  return (
    <section>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-border pb-3"
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-colors ${
                active
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 font-mono text-[11px] ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-h-[calc(100dvh-30rem)] min-h-[14rem] overflow-y-auto pr-1 pt-6">
        {tab === 'experience' && <ExperiencePanel items={experience} />}
        {tab === 'projects' && <ProjectsPanel projects={projects} />}
        {tab === 'skills' &&
          (skills.length ? (
            <ChipList items={skills} />
          ) : (
            <Empty>No skills found.</Empty>
          ))}
        {tab === 'claims' && <ClaimsPanel claims={claims} />}
      </div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

/* ── Panels ── */

function ClaimsPanel({ claims }: { claims: Claim[] }) {
  if (claims.length === 0)
    return <Empty>No strong claims found. Try a more detailed resume.</Empty>;
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        These are what the interview will probe.
      </p>
      <ul className="space-y-3">
        {claims.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-card-foreground">{c.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="muted">{c.category}</Badge>
              {c.relatedSkills.slice(0, 4).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              <span
                className="ml-auto flex items-center gap-1"
                title={`Priority ${c.priority}/5`}
              >
                <Dots value={c.priority} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dots({ value }: { value: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < value ? 'bg-primary' : 'bg-border'}`}
        />
      ))}
    </>
  );
}

function ExperiencePanel({ items }: { items: ExtractedResume['experience'] }) {
  if (items.length === 0) return <Empty>No experience found.</Empty>;
  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="font-medium">
              {[e.role, e.company].filter(Boolean).join(' · ') || 'Role'}
            </p>
            {e.duration && (
              <span className="font-mono text-xs text-muted-foreground">
                {e.duration}
              </span>
            )}
          </div>
          {e.highlights.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {e.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function ProjectsPanel({ projects }: { projects: ProjectItem[] }) {
  if (projects.length === 0) return <Empty>No projects found.</Empty>;
  return (
    <div className="space-y-3">
      {projects.map((p, i) => (
        <ProjectCard key={i} project={p} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  const work = project.origin === 'professional';
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium">{project.name}</p>
        <Badge tone="muted">
          {work ? `Work${project.org ? ` · ${project.org}` : ''}` : 'Personal'}
        </Badge>
      </div>
      {project.description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      )}
      {project.tech.length > 0 && (
        <div className="mt-3">
          <ChipList items={project.tech} />
        </div>
      )}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <Badge key={s} tone="muted">
          {s}
        </Badge>
      ))}
    </div>
  );
}
