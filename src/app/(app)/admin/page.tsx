'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/page-header';
import { PageLoader } from '@/components/ui/page-loader';
import { ChevronDownIcon } from '@/components/icons';
import { RANGES, useUsage, type RangeKey } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { UsageSummary } from '@/lib/contracts';

type Provider = UsageSummary['providers'][number];

/** Spend is in cents-and-under territory, so plain $0.00 would read as zero everywhere. */
function usd(value: number): string {
  if (value === 0) return '$0';
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(2)}`;
}

const inr = (value: number, rate: number): string => {
  const rupees = value * rate;
  if (rupees === 0) return '₹0';
  if (rupees < 0.01) return '<₹0.01';
  return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: rupees < 100 ? 2 : 0 })}`;
};

const compact = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
      ? `${(n / 1000).toFixed(1)}k`
      : String(n);

const percent = (share: number): string =>
  `${(share * 100).toFixed(share > 0 && share < 0.1 ? 1 : 0)}%`;

/** Who we pay. The dot colour is reused in the split bar and the daily chart. */
const PROVIDER_META: Record<
  string,
  { name: string; role: string; dot: string }
> = {
  euri: { name: 'Euri', role: 'LLM', dot: 'bg-primary' },
  deepgram: { name: 'Deepgram', role: 'Voice', dot: 'bg-success' },
};
const metaFor = (id: string) =>
  PROVIDER_META[id] ?? { name: id, role: '', dot: 'bg-warning' };

const KIND_LABEL: Record<string, string> = {
  llm: 'LLM',
  stt: 'Speech-to-text',
  tts: 'Text-to-speech',
};

function modelVolume(m: Provider['models'][number]): string {
  if (m.kind === 'stt') return `${(m.units / 60).toFixed(1)} min`;
  if (m.kind === 'tts') return `${compact(Math.round(m.units))} chars`;
  return m.inputTokens + m.outputTokens > 0
    ? `${compact(m.inputTokens)} in / ${compact(m.outputTokens)} out`
    : '—';
}

export default function AdminPage() {
  const [range, setRange] = useState<RangeKey>('today');
  const { data, isLoading, error } = useUsage(range);

  if (isLoading) return <PageLoader label="Adding it up…" />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="font-medium">This page is for admins only.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Admins are set with ADMIN_EMAILS on the server.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  const { totals, currency, providers } = data;
  const rate = currency.usdToInr;

  return (
    <div className="pb-20">
      <PageHeader
        title="Usage & spend"
        actions={<RangeTabs value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        <Stat
          label="Spend"
          value={usd(totals.usd)}
          sub={inr(totals.usd, rate)}
          accent
        />
        <Stat
          label="Per interview"
          value={usd(totals.perInterviewUsd)}
          sub={inr(totals.perInterviewUsd, rate)}
        />
        <Stat label="Interviews" value={String(totals.interviews)} />
        <Stat label="API calls" value={compact(totals.calls)} />
      </div>

      <Card title="Where it went" className="mt-6">
        <SplitBar providers={providers} />
        <ul className="divide-y divide-border">
          {providers.map((p) => (
            <ProviderRow key={p.provider} p={p} rate={rate} />
          ))}
        </ul>
      </Card>

      {data.byDay.length > 1 && (
        <DailySpend days={data.byDay} providers={providers} rate={rate} />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card title="Top spenders">
          {data.topUsers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing in this period.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.topUsers.map((user, i) => (
                <li
                  key={`${user.userId ?? 'deleted'}-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate',
                      !user.userId && 'italic text-muted-foreground',
                    )}
                  >
                    {user.email}
                  </span>
                  <Money
                    usd={user.costUsd}
                    rate={rate}
                    className="w-24 shrink-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Turn latency" note="what a candidate waits for">
          <div className="grid grid-cols-3 divide-x divide-border">
            {(['p50', 'p95', 'max'] as const).map((key) => {
              const ms = data.turnLatencyMs[key];
              return (
                <div key={key} className="px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    {key}
                  </p>
                  <p
                    className={cn(
                      'mt-1 text-xl font-semibold tabular-nums',
                      ms === 0
                        ? 'text-muted-foreground'
                        : ms > 6000
                          ? 'text-destructive'
                          : ms > 3500
                            ? 'text-warning'
                            : 'text-success',
                    )}
                  >
                    {ms === 0 ? '—' : `${(ms / 1000).toFixed(1)}s`}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
        {currency.source === 'fallback'
          ? `Rupees use a fixed ₹${currency.usdToInr}/$ (live rate unavailable).`
          : `Rupees use ₹${currency.usdToInr.toFixed(2)}/$ (${currency.source}).`}{' '}
        Costs are estimates from public list prices, not invoices. Fix{' '}
        <span className="font-mono">config/pricing.ts</span> from a real bill
        and every figure recomputes.
      </p>
    </div>
  );
}

/* ── pieces ── */

/** Today · Yesterday · Last 7 days · … as one segmented control. */
function RangeTabs({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (k: RangeKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1"
    >
      {RANGES.map((r) => {
        const active = r.key === value;
        return (
          <button
            key={r.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(r.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition-colors',
              active
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1.5 text-2xl font-semibold tabular-nums',
          accent && 'text-primary',
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

/** Dollars stay the headline; the rupee equivalent sits under it. */
function Money({
  usd: value,
  rate,
  className,
}: {
  usd: number;
  rate: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'whitespace-nowrap text-right font-mono tabular-nums',
        className,
      )}
    >
      <p className="text-sm">{usd(value)}</p>
      <p className="text-[11px] leading-tight text-muted-foreground">
        {inr(value, rate)}
      </p>
    </div>
  );
}

function Card({
  title,
  note,
  className,
  children,
}: {
  title: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      {children}
    </section>
  );
}

/** How the spend divides between the providers, at a glance. */
function SplitBar({ providers }: { providers: Provider[] }) {
  const total = providers.reduce((sum, p) => sum + p.usd, 0);
  return (
    <div className="border-b border-border px-4 py-4">
      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={providers
          .map((p) => `${metaFor(p.provider).name} ${percent(p.share)}`)
          .join(', ')}
      >
        {total > 0 &&
          providers.map((p) =>
            p.usd > 0 ? (
              <div
                key={p.provider}
                className={metaFor(p.provider).dot}
                style={{ flex: `${p.usd} 1 0%` }}
              />
            ) : null,
          )}
      </div>
    </div>
  );
}

/** One provider: the headline numbers, with its models and steps a click away. */
function ProviderRow({ p, rate }: { p: Provider; rate: number }) {
  const [open, setOpen] = useState(false);
  const meta = metaFor(p.provider);
  const steps = p.tasks.filter((t) => t.task !== t.kind); // Deepgram's "steps" are just stt/tts

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} />
        <span className="min-w-0 flex-1">
          <span className="font-medium capitalize">{meta.name}</span>
          {meta.role && (
            <span className="ml-2 text-sm text-muted-foreground">
              {meta.role}
            </span>
          )}
        </span>
        <span className="hidden font-mono text-xs tabular-nums text-muted-foreground sm:block">
          {compact(p.calls)} calls · {percent(p.share)}
        </span>
        <Money usd={p.usd} rate={rate} className="w-24 shrink-0" />
        <ChevronDownIcon
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border bg-surface/40 px-4 pb-4 pt-3">
          {p.models.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">
              Nothing in this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-sm">
                <thead>
                  <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-normal">Model</th>
                    <th className="px-3 py-2 text-right font-normal">Calls</th>
                    <th className="px-3 py-2 text-right font-normal">Volume</th>
                    <th className="py-2 pl-3 text-right font-normal">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {p.models.map((m) => (
                    <tr
                      key={`${m.kind}-${m.model}`}
                      className="border-t border-border"
                    >
                      <td className="py-2.5 pr-3">
                        <p className="truncate font-medium">{m.model}</p>
                        <p className="text-xs text-muted-foreground">
                          {KIND_LABEL[m.kind] ?? m.kind}
                          {m.estimated && ' · rate estimated'}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-muted-foreground">
                        {compact(m.calls)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {modelVolume(m)}
                      </td>
                      <td className="py-2.5 pl-3">
                        <Money usd={m.costUsd} rate={rate} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {steps.length > 0 && (
            <>
              <p className="mb-1 mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Steps
              </p>
              <ul className="divide-y divide-border">
                {steps.map((t) => (
                  <li
                    key={`${t.kind}-${t.task}`}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <span className="flex-1 capitalize">
                      {t.task.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {compact(t.calls)} calls
                    </span>
                    <Money
                      usd={t.costUsd}
                      rate={rate}
                      className="w-24 shrink-0"
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Daily spend, stacked by provider. Only shown for periods longer than a day.
 * Hover gives the exact figures rather than labelling every bar.
 */
function DailySpend({
  days,
  providers,
  rate,
}: {
  days: UsageSummary['byDay'];
  providers: Provider[];
  rate: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const peak = Math.max(...days.map((d) => d.costUsd), 0.0001);
  const active = hovered !== null ? days[hovered] : null;

  return (
    <Card title="Daily spend" note={`Peak ${usd(peak)}`} className="mt-6">
      <div className="px-4 pb-4 pt-4">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {providers.map((p) => (
            <span key={p.provider} className="flex items-center gap-1.5">
              <span
                className={cn('h-2 w-2 rounded-full', metaFor(p.provider).dot)}
              />
              {metaFor(p.provider).name}
            </span>
          ))}
        </div>

        <div className="relative flex h-32 items-end gap-[2px]">
          {days.map((day, i) => (
            <div
              key={day.day}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex h-full flex-1 cursor-default items-end"
            >
              <div
                className={cn(
                  'flex w-full flex-col-reverse overflow-hidden rounded-t transition-opacity',
                  hovered !== null && hovered !== i && 'opacity-45',
                )}
                // A day with spend always shows a sliver, so "small" never reads as "none".
                style={{
                  height: `${Math.max(3, (day.costUsd / peak) * 100)}%`,
                }}
              >
                {providers.map((p) => {
                  const value = day.byProvider[p.provider] ?? 0;
                  return value > 0 ? (
                    <div
                      key={p.provider}
                      className={metaFor(p.provider).dot}
                      style={{ flex: `${value} 1 0%` }}
                    />
                  ) : null;
                })}
              </div>
            </div>
          ))}

          {active && (
            <div className="pointer-events-none absolute -top-1 left-1/2 z-10 min-w-48 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-pop">
              <p className="font-medium tabular-nums">
                {usd(active.costUsd)}{' '}
                <span className="font-normal text-muted-foreground">
                  · {inr(active.costUsd, rate)}
                </span>
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {providers.map((p) => {
                  const value = active.byProvider[p.provider] ?? 0;
                  return (
                    <li
                      key={p.provider}
                      className="flex items-center gap-1.5 tabular-nums"
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          metaFor(p.provider).dot,
                        )}
                      />
                      <span className="flex-1">{metaFor(p.provider).name}</span>
                      <span>{usd(value)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1.5 text-muted-foreground/70">
                {active.day} · {active.calls} calls
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground/60">
          <span>{days[0]?.day}</span>
          <span>{days.at(-1)?.day}</span>
        </div>
      </div>
    </Card>
  );
}
