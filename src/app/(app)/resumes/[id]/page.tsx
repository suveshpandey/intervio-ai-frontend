'use client';

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
      {error && <StateNote tone="error">Couldn&apos;t load this resume.</StateNote>}

      {data &&
        (() => {
          const { resume, claims } = data;
          const status = resume.parseStatus;

          if (status === 'pending' || status === 'processing') return <Analyzing name={resume.fileName} />;
          if (status === 'failed') return <Failed error={resume.parseError} />;

          const extracted = resume.extracted;
          return (
            <div className="space-y-12">
              <div>
                <div className="mb-3 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Link href="/dashboard" className="transition-colors hover:text-foreground">
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                  <span className="truncate text-foreground">{resume.fileName}</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Here&apos;s what we found</h1>
                {extracted?.summary && (
                  <p className="mt-3 max-w-2xl text-muted-foreground">{extracted.summary}</p>
                )}
              </div>

              {jd.data && jd.data.jd.requiredSkills.length > 0 && (
                <Section title="Target role — required skills">
                  <ChipList items={jd.data.jd.requiredSkills} />
                </Section>
              )}

              <ClaimsSection claims={claims} />

              {extracted && <ExtractionSections extracted={extracted} />}

              <div className="flex items-center gap-3 border-t border-border pt-8">
                <Link href={`/review/${resume.id}${jdId ? `?jd=${jdId}` : ''}`}>
                  <Button>Set up interview</Button>
                </Link>
                <Link href="/new">
                  <Button variant="outline">Analyze another</Button>
                </Link>
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
            Reading your resume and extracting claims — this takes a few seconds.
          </p>
        </div>
        <span className="dash-line" aria-hidden />
      </div>
    </div>
  );
}

function Failed({ error }: { error: string | null }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="max-w-md space-y-4">
        <p className="text-lg font-medium">We couldn&apos;t read that resume</p>
        <p className="text-sm text-muted-foreground">
          {error ?? 'The file may be scanned, image-only, or corrupted. Try a text-based PDF or DOCX.'}
        </p>
        <Link href="/new">
          <Button>Try another file</Button>
        </Link>
      </div>
    </div>
  );
}

function StateNote({ children, tone }: { children: React.ReactNode; tone?: 'error' }) {
  return (
    <p className={tone === 'error' ? 'text-destructive' : 'text-muted-foreground'}>{children}</p>
  );
}

/* ── Claims (the differentiator) ── */

function ClaimsSection({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) {
    return (
      <Section title="Claims to defend">
        <p className="text-sm text-muted-foreground">No strong claims found. Try a more detailed resume.</p>
      </Section>
    );
  }
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Claims to defend</h2>
        <span className="text-sm text-muted-foreground">{claims.length} found</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        &ldquo;Go beyond the resume.&rdquo; These are what the interview will probe.
      </p>
      <ul className="mt-5 space-y-3">
        {claims.map((c) => (
          <li key={c.id} className="rounded-[var(--radius)] border border-border bg-card p-4">
            <p className="text-card-foreground">{c.text}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="muted">{c.category}</Badge>
              {c.relatedSkills.slice(0, 4).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              <span className="ml-auto flex items-center gap-1" title={`Priority ${c.priority}/5`}>
                <Dots value={c.priority} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
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

/* ── Extraction (skills / projects / experience) ── */

function ExtractionSections({ extracted }: { extracted: ExtractedResume }) {
  return (
    <>
      {extracted.skills.length > 0 && (
        <Section title="Skills">
          <ChipList items={extracted.skills} />
        </Section>
      )}

      <ProjectSections projects={extracted.projects} />

      {extracted.experience.length > 0 && (
        <Section title="Experience">
          <div className="space-y-5">
            {extracted.experience.map((e, i) => (
              <div key={i}>
                <p className="font-medium">
                  {[e.role, e.company].filter(Boolean).join(' · ') || 'Role'}
                  {e.duration && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">{e.duration}</span>
                  )}
                </p>
                {e.highlights.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {e.highlights.map((h, j) => (
                      <li key={j}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function ProjectSections({ projects }: { projects: ProjectItem[] }) {
  const personal = projects.filter((p) => p.origin !== 'professional');
  const professional = projects.filter((p) => p.origin === 'professional');

  // Group professional projects by the company they were built at.
  const byOrg = new Map<string, ProjectItem[]>();
  for (const p of professional) {
    const org = p.org?.trim() || 'Work';
    const list = byOrg.get(org);
    if (list) list.push(p);
    else byOrg.set(org, [p]);
  }

  return (
    <>
      {personal.length > 0 && (
        <Section title="Projects">
          <div className="space-y-4">
            {personal.map((p, i) => (
              <ProjectCard key={i} project={p} />
            ))}
          </div>
        </Section>
      )}

      {professional.length > 0 && (
        <Section title="Professional work">
          <div className="space-y-6">
            {[...byOrg.entries()].map(([org, items]) => (
              <div key={org}>
                <p className="mb-3 text-sm font-medium text-muted-foreground">at {org}</p>
                <div className="space-y-4">
                  {items.map((p, i) => (
                    <ProjectCard key={i} project={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <div>
      <p className="font-medium">{project.name}</p>
      {project.description && <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>}
      {project.tech.length > 0 && (
        <div className="mt-2">
          <ChipList items={project.tech} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
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
