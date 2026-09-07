'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BlueprintWithClaims, Claim } from '@/lib/contracts';

const SECTION_META: Record<string, { bar: string; dot: string; desc: string }> = {
  intro: { bar: 'bg-primary/25', dot: 'bg-primary/40', desc: 'A quick warm-up to settle in and set the context.' },
  claim_verification: {
    bar: 'bg-primary',
    dot: 'bg-primary',
    desc: 'The core — I press on your strongest claims to see if they hold up.',
  },
  fundamentals: { bar: 'bg-primary/55', dot: 'bg-primary/70', desc: 'Checking the foundations behind what you have built.' },
  problem_solving: { bar: 'bg-primary/70', dot: 'bg-primary/80', desc: 'A live problem to see how you think, not just what you know.' },
  wrap: { bar: 'bg-primary/25', dot: 'bg-primary/40', desc: 'Your questions, and a clean close.' },
};

const META_FALLBACK = { bar: 'bg-primary/40', dot: 'bg-primary/50', desc: '' };
const meta = (key: string) => SECTION_META[key] ?? META_FALLBACK;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function BlueprintPreview({ data }: { data: BlueprintWithClaims }) {
  const { blueprint, probedClaims } = data;
  const [active, setActive] = useState<string | null>(null);
  const [showClaims, setShowClaims] = useState(true);

  return (
    <div className="space-y-10">
      {/* Header + config */}
      <div className="rise">
        <h1 className="text-2xl font-semibold tracking-tight">Here&apos;s your interview</h1>
        <p className="mt-2 text-muted-foreground">
          I&apos;ll challenge <span className="text-foreground">{probedClaims.length}</span> of your strongest claims
          across {blueprint.sections.length} sections.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{blueprint.durationMin} min</Badge>
          <Badge tone="muted">{cap(blueprint.level)}</Badge>
          <Badge tone="muted">{cap(blueprint.difficulty)}</Badge>
          <Badge tone="muted">{blueprint.role}</Badge>
        </div>
      </div>

      {/* Proportional timeline ribbon */}
      <div className="rise" style={{ animationDelay: '60ms' }}>
        <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
          {blueprint.sections.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-label={`${s.title}, ${s.budgetMin} minutes`}
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
              style={{ width: `${(s.budgetMin / blueprint.durationMin) * 100}%` }}
              className={cn(
                'h-full transition-all duration-200',
                meta(s.key).bar,
                active === s.key && 'brightness-125',
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {blueprint.sections.map((s) => (
            <span
              key={s.key}
              className={cn('inline-flex items-center gap-1.5 transition-colors', active === s.key && 'text-foreground')}
              onMouseEnter={() => setActive(s.key)}
              onMouseLeave={() => setActive(null)}
            >
              <span className={cn('h-2 w-2 rounded-full', meta(s.key).dot)} />
              {s.title} · {s.budgetMin}m
            </span>
          ))}
        </div>
      </div>

      {/* Journey spine */}
      <div className="relative pl-8">
        <span className="absolute bottom-3 left-3 top-3 w-px bg-border" aria-hidden />
        <div className="space-y-3">
          {blueprint.sections.map((s, i) => {
            const isClaims = s.key === 'claim_verification';
            return (
              <div key={s.key} className="rise" style={{ animationDelay: `${120 + i * 70}ms` }}>
                <div className="relative">
                  <span
                    className={cn(
                      'absolute -left-[1.4rem] top-4 h-3 w-3 rounded-full ring-4 ring-background transition-transform',
                      meta(s.key).dot,
                      active === s.key && 'scale-125',
                    )}
                    aria-hidden
                  />
                  <div
                    onMouseEnter={() => setActive(s.key)}
                    onMouseLeave={() => setActive(null)}
                    className={cn(
                      'rounded-[var(--radius)] border bg-card p-4 transition-all duration-200',
                      active === s.key ? 'border-primary/60 shadow-[0_0_0_1px_var(--primary)]' : 'border-border',
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium">{s.title}</span>
                      <span className="shrink-0 text-sm text-muted-foreground">{s.budgetMin} min</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{meta(s.key).desc}</p>

                    {isClaims && probedClaims.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowClaims((v) => !v)}
                        className="mt-3 text-xs font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {showClaims ? 'Hide' : 'Show'} the {probedClaims.length} claims
                      </button>
                    )}
                  </div>

                  {/* Claim tree — branches off the claim-verification node */}
                  {isClaims && showClaims && (
                    <div className="relative ml-1 mt-3 space-y-3 border-l border-border pl-6">
                      {probedClaims.map((c, ci) => (
                        <ClaimBranch key={c.id} claim={c} index={ci} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ClaimBranch({ claim, index }: { claim: Claim; index: number }) {
  return (
    <div className="relative rise" style={{ animationDelay: `${index * 55}ms` }}>
      <span className="absolute -left-6 top-5 h-px w-5 bg-border" aria-hidden />
      <span className="absolute -left-[1.65rem] top-[1.15rem] h-2 w-2 rounded-full bg-primary/60" aria-hidden />
      <div className="rounded-[var(--radius)] border border-border bg-card/60 p-3 transition-colors hover:border-primary/40">
        <div className="flex items-start gap-2.5">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-medium text-primary">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-card-foreground">{claim.text}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge tone="muted">{claim.category}</Badge>
              {claim.relatedSkills.slice(0, 3).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
              <span className="ml-auto flex items-center gap-1" title={`Priority ${claim.priority}/5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={cn('h-1.5 w-1.5 rounded-full', i < claim.priority ? 'bg-primary' : 'bg-border')}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
