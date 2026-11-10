import { Reveal } from '@/components/landing/reveal';
import { cn } from '@/lib/utils';

/**
 * One product idea per screen: a quiet title and paragraph on one side, a big
 * soft-cornered panel on the other. `flip` alternates the sides down the page.
 */
export function SplitSection({
  id,
  title,
  body,
  action,
  flip,
  tone = 'glow',
  children,
}: {
  id?: string;
  title: React.ReactNode;
  body: React.ReactNode;
  action?: React.ReactNode;
  flip?: boolean;
  tone?: 'glow' | 'dark';
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-12 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-24">
        <Reveal className={cn(flip && 'lg:order-2')}>
          <h2 className="text-balance text-4xl font-normal leading-[1.08] tracking-[-0.035em] sm:text-5xl">
            {title}
          </h2>
          <div className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{body}</div>
          {action ? <div className="mt-8">{action}</div> : null}
        </Reveal>

        <Reveal delay={90} className={cn(flip && 'lg:order-1')}>
          <div
            className={cn(
              'relative grid h-[480px] place-items-center overflow-hidden rounded-[2.5rem] p-6 sm:h-[560px] sm:p-10',
              tone === 'dark' ? 'text-white' : 'bg-surface',
            )}
            style={
              tone === 'dark'
                ? {
                    background:
                      'radial-gradient(circle at 50% 50%, #05070f 28%, #1a2a6c 78%, #263a8f 100%)',
                  }
                : undefined
            }
          >
            {tone === 'glow' ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(60% 45% at 50% 8%, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(255,190,150,0.18), transparent 70%), radial-gradient(40% 50% at 100% 100%, rgba(150,220,180,0.18), transparent 70%)',
                }}
              />
            ) : null}
            <div className="relative max-h-full w-full overflow-y-auto">{children}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
