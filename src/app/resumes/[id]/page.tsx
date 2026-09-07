'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useRequireAuth } from '@/lib/auth';
import { useResume, useJd } from '@/lib/resumes';
import type { Claim, ExtractedResume } from '@/lib/contracts';

export default function ResumeResultPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const jdId = useSearchParams().get('jd');

  const { data, isLoading, error } = useResume(params.id);
  const jd = useJd(jdId);

  if (authLoading || !user) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Loading…</main>;
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        {isLoading && <StateNote>Loading…</StateNote>}
        {error && <StateNote tone="error">Couldn&apos;t load this resume.</StateNote>}

        {data && (() => {
          const { resume, claims } = data;
          const status = resume.parseStatus;

          if (status === 'pending' || status === 'processing') return <Analyzing name={resume.fileName} />;
          if (status === 'failed') return <Failed error={resume.parseError} />;

          const extracted = resume.extracted;
          return (
            <div className="space-y-12">
              <div>
                <p className="text-sm text-muted-foreground">{resume.fileName}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">Here&apos;s what we found</h1>
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

              <div className="border-t border-border pt-8">
                <Link href="/new">
                  <Button variant="outline">Analyze another</Button>
                </Link>
              </div>
            </div>
          );
        })()}
      </main>
    </div>
  );
}

/* ── States ── */

function Analyzing({ name }: { name: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div className="space-y-4">
        <Spinner className="mx-auto h-6 w-6 text-primary" />
        <div>
          <p className="font-medium">Analyzing {name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Reading your resume and extracting claims — this takes a few seconds.
          </p>
        </div>
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
        &ldquo;You said it. Now prove it.&rdquo; These are what the interview will probe.
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

      {extracted.projects.length > 0 && (
        <Section title="Projects">
          <div className="space-y-4">
            {extracted.projects.map((p, i) => (
              <div key={i}>
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
                {p.tech.length > 0 && (
                  <div className="mt-2">
                    <ChipList items={p.tech} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

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
