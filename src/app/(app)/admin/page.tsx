'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/app/page-header';
import { PageLoader } from '@/components/ui/page-loader';
import { useUsage } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { UsageSummary } from '@/lib/contracts';

/** Spend is in cents-and-under territory, so plain $0.00 would read as zero everywhere. */
function usd(value: number): string {
  if (value === 0) return '$0';
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(2)}`;
}

const inr = (value: number, rate: number): string =>
  `₹${(value * rate).toLocaleString('en-IN', { maximumFractionDigits: value * rate < 100 ? 2 : 0 })}`;

const compact = (n: number): string =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

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

  const { totals, currency, windowDays } = data;

  return (
    <div className="pb-20">
      <PageHeader title="Usage & spend" description={`Everything metered. Last ${windowDays} days unless stated.`} />

      {/* The four numbers worth knowing at a glance. */}
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        <Stat label="Today" value={usd(totals.todayUsd)} sub={inr(totals.todayUsd, currency.usdToInr)} />
        <Stat label="Last 7 days" value={usd(totals.weekUsd)} sub={inr(totals.weekUsd, currency.usdToInr)} />
        <Stat
          label="Per interview"
          value={usd(totals.perInterviewUsd)}
          sub={`${inr(totals.perInterviewUsd, currency.usdToInr)} · ${totals.interviews} interviews`}
          accent
        />
        <Stat
          label="All time"
          value={usd(totals.allTimeUsd)}
          sub={`${inr(totals.allTimeUsd, currency.usdToInr)} · ${compact(totals.allTimeCalls)} calls`}
        />
      </div>

      <DailySpend days={data.byDay} rate={currency.usdToInr} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Where the money goes" note="By model, last 30 days">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-normal">Model</th>
                <th className="px-4 py-2.5 text-right font-normal">Calls</th>
                <th className="px-4 py-2.5 text-right font-normal">Volume</th>
                <th className="px-4 py-2.5 text-right font-normal">Cost</th>
              </tr>
            </thead>
            <tbody>
              {data.byModel.map((row) => (
                <tr key={`${row.provider}-${row.model}`} className="border-b border-border last:border-0">
                  <td className="max-w-[13rem] px-4 py-3">
                    <p className="truncate font-medium">{row.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.provider}
                      {row.estimated && ' · rate estimated'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {compact(row.calls)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {row.inputTokens + row.outputTokens > 0
                      ? `${compact(row.inputTokens)} in / ${compact(row.outputTokens)} out`
                      : row.units > 0
                        ? `${compact(Math.round(row.units))} ${row.model.startsWith('flux') ? 'chars' : 'sec'}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{usd(row.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-6">
          <Card title="By step" note="Which part of the product spends it">
            <ul className="divide-y divide-border">
              {data.byTask.map((row) => (
                <li key={`${row.kind}-${row.task}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="flex-1 capitalize">{row.task.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {compact(row.calls)} calls
                  </span>
                  <span className="w-16 text-right font-mono tabular-nums">{usd(row.costUsd)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Live turn latency" note="Model call only — what a candidate waits for">
            <div className="grid grid-cols-3 divide-x divide-border">
              {(['p50', 'p95', 'max'] as const).map((key) => (
                <div key={key} className="px-4 py-4">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{key}</p>
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
        </div>
      </div>

      <Card title="Top spenders" note="Last 30 days" className="mt-6">
        <ul className="divide-y divide-border">
          {data.topUsers.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">Nothing metered yet.</li>
          ) : (
            data.topUsers.map((user, i) => (
              <li key={`${user.userId ?? 'deleted'}-${i}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="font-mono text-xs text-muted-foreground/60">{i + 1}</span>
                <span className={cn('flex-1 truncate', !user.userId && 'italic text-muted-foreground')}>
                  {user.email}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {compact(user.calls)} calls
                </span>
                <span className="w-16 text-right font-mono tabular-nums">{usd(user.costUsd)}</span>
              </li>
            ))
          )}
        </ul>
      </Card>

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
        Rates are estimates from public list prices, not invoices — euri doesn&apos;t publish a
        per-model rate card. Update <span className="font-mono">config/pricing.ts</span> from a real
        bill and every figure here recomputes, since the token and second counts are stored raw.
      </p>
    </div>
  );
}

/* ── pieces ── */

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-card px-5 py-4">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn('mt-1.5 text-2xl font-semibold tabular-nums', accent && 'text-primary')}>{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Card({
  title,
  note,
  className,
  children,
}: {
  title: string;
  note?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex items-baseline justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>
      {children}
    </section>
  );
}

/**
 * Daily spend. One series, so no legend — the title names it. Hover gives the
 * exact figure rather than labelling every bar.
 */
function DailySpend({ days, rate }: { days: UsageSummary['byDay']; rate: number }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (days.length === 0) return null;
  const peak = Math.max(...days.map((d) => d.costUsd), 0.0001);
  const active = hovered !== null ? days[hovered] : null;

  return (
    <Card title="Daily spend" note={`Peak ${usd(peak)}`} className="mt-6">
      <div className="px-4 pb-4 pt-5">
        <div className="relative flex h-32 items-end gap-[2px]">
          {days.map((day, i) => (
            <div
              key={day.day}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="group relative flex h-full flex-1 cursor-default items-end"
            >
              <div
                className={cn(
                  'w-full rounded-t transition-colors',
                  hovered === i ? 'bg-primary' : 'bg-primary/45',
                )}
                // A day with spend always shows a sliver, so "small" never reads as "none".
                style={{ height: `${Math.max(3, (day.costUsd / peak) * 100)}%` }}
              />
            </div>
          ))}

          {active && (
            <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-pop">
              <p className="font-medium tabular-nums">{usd(active.costUsd)}</p>
              <p className="text-muted-foreground">
                {inr(active.costUsd, rate)} · {active.calls} calls
              </p>
              <p className="mt-0.5 text-muted-foreground/70">{active.day}</p>
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
