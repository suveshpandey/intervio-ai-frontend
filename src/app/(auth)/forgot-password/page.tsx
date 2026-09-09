'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MailIcon } from '@/components/icons';
import { AuthHomeLink } from '@/components/auth/auth-home-link';
import { useForgotPassword } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await forgot.mutateAsync(email);
    } catch {
      // Intentionally ignored — we show the same confirmation either way (no account enumeration).
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <AuthHomeLink />
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="text-center">
            <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
              <MailIcon className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for <span className="text-foreground">{email}</span>, we&apos;ve
              sent a link to reset your password. It expires in 60 minutes.
            </p>
            <Link href="/login" className="mt-6 inline-block">
              <Button variant="outline">Back to log in</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                name="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<MailIcon />}
              />
              <Button type="submit" className="w-full" loading={forgot.isPending}>
                {forgot.isPending ? 'Sending link…' : 'Send reset link'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered it?{' '}
              <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
