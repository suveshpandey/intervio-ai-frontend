import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <span className="mb-6 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
        Voice interviews for developers
      </span>

      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        You said it. <span className="text-primary">Now prove it.</span>
      </h1>

      <p className="mt-5 max-w-xl text-balance text-muted-foreground">
        Intervio is a browser voice interviewer that checks whether you can actually defend what’s on
        your resume — then tells you how ready you are and exactly what to work on.
      </p>

      <div className="mt-8 flex gap-3">
        <Link href="/signup">
          <Button>Get started</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Log in</Button>
        </Link>
      </div>
    </main>
  );
}
