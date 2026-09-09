'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LockIcon, EyeIcon, EyeOffIcon } from '@/components/icons';
import { AuthHomeLink } from '@/components/auth/auth-home-link';
import { useResetPassword } from '@/lib/auth';
import { ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <AuthHomeLink />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <ResetInner />
      </Suspense>
    </main>
  );
}

function ResetInner() {
  const token = useSearchParams().get('token');
  const reset = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Link invalid or expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This password-reset link is missing or no longer valid. Request a fresh one.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-block">
          <Button>Request a new link</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Password updated</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You can now log in with your new password.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button>Go to log in</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    try {
      await reset.mutateAsync({ token: token!, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password.');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <PasswordField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
        />
        <PasswordField
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" loading={reset.isPending}>
          {reset.isPending ? 'Updating…' : 'Set new password'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}

function PasswordField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <Input
      {...props}
      type={show ? 'text' : 'password'}
      minLength={8}
      required
      icon={<LockIcon />}
      trailing={
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      }
    />
  );
}
