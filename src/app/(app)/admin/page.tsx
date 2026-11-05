'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/page-header';
import { PageLoader } from '@/components/ui/page-loader';
import { useUsage } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { UsageSummary } from '@/lib/contracts';

type Provider = UsageSummary['providers'][number];
type ModelRow = Provider['models'][number];

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

/** Who we pay, in the order they're shown. The dot colour is reused in the chart and split bar. */
const PROVIDER_META: Record<string, { name: string; role: string; desc: string; dot: string }> = {
  euri: {
    name: 'Euri',
    role: 'LLM API',
    desc: 'Planning, interview turns, evaluation and reports',
    dot: 'bg-primary',
  },
  deepgram: {
    name: 'Deepgram',
    role: 'Voice API',
    desc: 'Live speech-to-text and text-to-speech',
    dot: 'bg-success',
  },
};

const metaFor = (id: string) =>
  PROVIDER_META[id] ?? { name: id, role: '', desc: '', dot: 'bg-warning' };

const KIND_LABEL: Record<string, string> = {
  llm: 'LLM',
  stt: 'Speech-to-text',
  tts: 'Text-to-speech',
};

function modelVolume(m: ModelRow): string {
  if (m.kind === 'stt') return `${(m.units / 60).toFixed(1)} min`;
  if (m.kind === 'tts') return `${compact(Math.round(m.units))} chars`;
  return m.inputTokens + m.outputTokens > 0
    ? `${compact(m.inputTokens)} in / ${compact(m.outputTokens)} out`
    : '—';
}

export default function AdminPage() {
  const { data, isLoading, error } = useUsage();

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

  const { totals, currency, windowDays, providers } = data;
  const rate = currency.usdToInr;

  return (
    <div className="pb-20">
      <PageHeader
        title="Usage & spend"
        description={`Everything metered. Last ${windowDays} days unless stated.`}
      />

      {/* The four numbers worth knowing at a glance. */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        <Stat label="Today" value={usd(totals.todayUsd)} sub={inr(totals.todayUsd, rate)} />
        <Stat label="Last 7 days" value={usd(totals.weekUsd)} sub={inr(totals.weekUsd, rate)} />
        <Stat
          label="Per interview"
          value={usd(totals.perInterviewUsd)}
          sub={`${inr(totals.perInterviewUsd, rate)} · ${totals.interviews} interviews`}
          accent
        />
        <Stat
          label="All time"
          value={usd(totals.allTimeUsd)}
          sub={`${inr(totals.allTimeUsd, rate)} · ${compact(totals.allTimeCalls)} calls`}
        />
      </div>

      <ProviderSplit providers={providers} rate={rate} windowDays={windowDays} />

      <DailySpend days={data.byDay} providers={providers} rate={rate} />

      {providers.map((p) => (
        <ProviderSection key={p.provider} p={p} rate={rate} windowDays={windowDays} />
      ))}

      <Card
        title="Live turn latency"
        note="Model call only — what a candidate waits for"
        className="mt-6"
      >
        <div className="grid grid-cols-3 divide-x divide-border">
          {(['p50', 'p95', 'max'] as const).map((key) => (
            <div key={key} className="px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {key}
              </p>
              <p
                className={cn(
                  'mt-1 text-xl font-semibold tabular-nums',
                  data.turnLatencyMs[key] > 6000
                    ? 'text-destructive'
                    : data.turnLatencyMs[key] > 3500
                      ? 'text-warning'
                      : 'text-success',
                )}
              >
                {(data.turnLatencyMs[key] / 1000).toFixed(1)}s
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Top spenders" note={`Last ${windowDays} days`} className="mt-6">
        <Scroll maxHeight="max-h-80">
          <ul className="min-w-[22rem] divide-y divide-border">
            {data.topUsers.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing metered yet.
              </li>
            ) : (
              data.topUsers.map((user, i) => (
                <li
                  key={`${user.userId ?? 'deleted'}-${i}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="font-mono text-xs text-muted-foreground/60">{i + 1}</span>
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate',
                      !user.userId && 'italic text-muted-foreground',
                    )}
                  >
                    {user.email}
                  </span>
                  <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {compact(user.calls)} calls
                  </span>
                  <Money usd={user.costUsd} rate={rate} className="w-24 shrink-0" />
                </li>
              ))
            )}
          </ul>
        </Scroll>
      </Card>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
        {currency.source === 'fallback'
          ? `Rupee figures use a fixed ₹${currency.usdToInr}/$ because the live rate couldn't be fetched.`
          : `Rupee figures use the live rate ₹${currency.usdToInr.toFixed(2)}/$ (${currency.source}, fetched ${new Date(currency.fetchedAt).toLocaleString()}).`}{' '}
        Rates are estimates from public list prices, not invoices — euri doesn&apos;t publish a
        per-model rate card and Deepgram&apos;s rate depends on your plan. Update{' '}
        <span className="font-mono">config/pricing.ts</span> from a real bill and every figure here
        recomputes, since the token and second counts are stored raw.
      </p>
    </div>
  );
}

/* ── pieces ── */

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
      <p className={cn('mt-1.5 text-2xl font-semibold tabular-nums', accent && 'text-primary')}>
        {value}
      </p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

/** Dollars stay the headline; the rupee equivalent sits under it. */
function Money({ usd: value, rate, className }: { usd: number; rate: number; className?: string }) {
  return (
    <div className={cn('whitespace-nowrap text-right font-mono tabular-nums', className)}>
      <p className="text-sm">{usd(value)}</p>
      <p className="text-[11px] leading-tight text-muted-foreground">{inr(value, rate)}</p>
    </div>
  );
}

/** Scrolls in both directions so a wide table never gets clipped by its card. */
function Scroll({
  maxHeight = 'max-h-[26rem]',
  children,
}: {
  maxHeight?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('overflow-auto overscroll-contain', maxHeight)}>{children}</div>;
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
    <section className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-border px-4 pb-2 pt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

/** Title for a provider card: coloured dot, name, and what it's for. */
function ProviderTitle({ id }: { id: string }) {
  const meta = metaFor(id);
  return (
    <span className="flex items-center gap-2">
      <span className={cn('h-2.5 w-2.5 rounded-full', meta.dot)} />
      <span className="capitalize">{meta.name}</span>
      {meta.role && <span className="font-normal text-muted-foreground">· {meta.role}</span>}
    </span>
  );
}

/** How the window's spend divides between the providers, before any detail. */
function ProviderSplit({
  providers,
  rate,
  windowDays,
}: {
  providers: Provider[];
  rate: number;
  windowDays: number;
}) {
  const total = providers.reduce((sum, p) => sum + p.window.usd, 0);

  return (
    <Card title="Spend by provider" note={`Last ${windowDays} days`} className="mt-6">
      <div className="px-4 pb-1 pt-4">
        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={providers
            .map((p) => `${metaFor(p.provider).name} ${percent(p.share)}`)
            .join(', ')}
        >
          {providers.map((p) =>
            p.window.usd > 0 ? (
              <div
                key={p.provider}
                className={metaFor(p.provider).dot}
                style={{ flex: `${p.window.usd} 1 0%` }}
              />
            ) : null,
          )}
        </div>
      </div>

      <Scroll maxHeight="max-h-80">
        <table className="w-full min-w-[30rem] text-sm">
          <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
            <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-2.5 font-normal">Provider</th>
              <th className="px-4 py-2.5 text-right font-normal">Calls</th>
              <th className="px-4 py-2.5 text-right font-normal">Share</th>
              <th className="px-4 py-2.5 text-right font-normal">Cost (USD / INR)</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => {
              const meta = metaFor(p.provider);
              return (
                <tr key={p.provider} className="border-b border-border">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} />
                      <span className="font-medium capitalize">{meta.name}</span>
                    </span>
                    {meta.role && (
                      <p className="ml-[18px] text-xs text-muted-foreground">{meta.role}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {compact(p.window.calls)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {percent(p.share)}
                  </td>
                  <td className="px-4 py-3">
                    <Money usd={p.window.usd} rate={rate} />
                  </td>
                </tr>
              );
            })}
            <tr className="font-medium">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {compact(providers.reduce((sum, p) => sum + p.window.calls, 0))}
              </td>
              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                {total > 0 ? '100%' : '0%'}
              </td>
              <td className="px-4 py-3">
                <Money usd={total} rate={rate} />
              </td>
            </tr>
          </tbody>
        </table>
      </Scroll>
    </Card>
  );
}

/** One provider's full picture: spend over time, raw volume, then models and steps. */
function ProviderSection({
  p,
  rate,
  windowDays,
}: {
  p: Provider;
  rate: number;
  windowDays: number;
}) {
  const meta = metaFor(p.provider);
  const { volume } = p;

  const showTokens = p.provider === 'euri' || volume.inputTokens + volume.outputTokens > 0;
  const showAudio = p.provider === 'deepgram' || volume.sttSeconds + volume.ttsChars > 0;
  // Deepgram's "steps" are just stt/tts, which the models table already separates.
  const showSteps = p.tasks.some((t) => t.task !== t.kind);

  return (
    <Card title={<ProviderTitle id={p.provider} />} note={meta.desc} className="mt-6">
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        <Stat
          label="Today"
          value={usd(p.today.usd)}
          sub={`${inr(p.today.usd, rate)} · ${compact(p.today.calls)} calls`}
        />
        <Stat
          label="Last 7 days"
          value={usd(p.week.usd)}
          sub={`${inr(p.week.usd, rate)} · ${compact(p.week.calls)} calls`}
        />
        <Stat
          label={`Last ${windowDays} days`}
          value={usd(p.window.usd)}
          sub={`${inr(p.window.usd, rate)} · ${compact(p.window.calls)} calls`}
          accent
        />
        <Stat
          label="All time"
          value={usd(p.allTime.usd)}
          sub={`${inr(p.allTime.usd, rate)} · ${compact(p.allTime.calls)} calls`}
        />
      </div>

      <SectionLabel>Usage · last {windowDays} days</SectionLabel>
      <dl className="flex flex-wrap gap-x-10 gap-y-3 px-4 pb-4">
        {showTokens && (
          <>
            <Fact label="Input tokens" value={compact(volume.inputTokens)} />
            <Fact label="Output tokens" value={compact(volume.outputTokens)} />
          </>
        )}
        {showAudio && (
          <>
            <Fact label="Speech-to-text" value={`${(volume.sttSeconds / 60).toFixed(1)} min`} />
            <Fact label="Text-to-speech" value={`${compact(Math.round(volume.ttsChars))} chars`} />
          </>
        )}
        <Fact label="Calls" value={compact(p.window.calls)} />
      </dl>

      <SectionLabel>Models · last {windowDays} days</SectionLabel>
      <Scroll>
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border),0_-1px_0_var(--border)]">
            <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-2.5 font-normal">Model</th>
              <th className="px-4 py-2.5 text-right font-normal">Calls</th>
              <th className="px-4 py-2.5 text-right font-normal">Volume</th>
              <th className="whitespace-nowrap px-4 py-2.5 text-right font-normal">
                Cost (USD / INR)
              </th>
            </tr>
          </thead>
          <tbody>
            {p.models.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  Nothing metered yet.
                </td>
              </tr>
            ) : (
              p.models.map((row) => (
                <tr
                  key={`${row.kind}-${row.model}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="max-w-[16rem] px-4 py-3">
                    <p className="truncate font-medium">{row.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {KIND_LABEL[row.kind] ?? row.kind}
                      {row.estimated && ' · rate estimated'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {compact(row.calls)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {modelVolume(row)}
                  </td>
                  <td className="px-4 py-3">
                    <Money usd={row.costUsd} rate={rate} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Scroll>

      {showSteps && (
        <>
          <SectionLabel>Steps · last {windowDays} days</SectionLabel>
          <Scroll maxHeight="max-h-72">
            <ul className="min-w-[22rem] divide-y divide-border border-t border-border">
              {p.tasks.map((row) => (
                <li
                  key={`${row.kind}-${row.task}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm"
                >
                  <span className="flex-1 whitespace-nowrap capitalize">
                    {row.task.replace(/_/g, ' ')}
                  </span>
                  <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
                    {compact(row.calls)} calls
                  </span>
                  <Money usd={row.costUsd} rate={rate} className="w-24 shrink-0" />
                </li>
              ))}
            </ul>
          </Scroll>
        </>
      )}
    </Card>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * Daily spend, stacked by provider. Two series, so there's a legend. Hover gives
 * the exact figures rather than labelling every bar.
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

  if (days.length === 0) return null;
  const peak = Math.max(...days.map((d) => d.costUsd), 0.0001);
  const active = hovered !== null ? days[hovered] : null;

  return (
    <Card title="Daily spend" note={`Peak ${usd(peak)}`} className="mt-6">
      <div className="px-4 pb-4 pt-4">
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          {providers.map((p) => (
            <span key={p.provider} className="flex items-center gap-1.5">
              <span className={cn('h-2 w-2 rounded-full', metaFor(p.provider).dot)} />
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
                style={{ height: `${Math.max(3, (day.costUsd / peak) * 100)}%` }}
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
                    <li key={p.provider} className="flex items-center gap-1.5 tabular-nums">
                      <span className={cn('h-2 w-2 rounded-full', metaFor(p.provider).dot)} />
                      <span className="flex-1">{metaFor(p.provider).name}</span>
                      <span>{usd(value)}</span>
                      <span className="text-muted-foreground">· {inr(value, rate)}</span>
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
