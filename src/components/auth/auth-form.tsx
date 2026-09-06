'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin, useSignup, googleLoginUrl } from '@/lib/auth';
import { ApiError } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const login = useLogin();
  const signup = useSignup();
  const [error, setError] = useState<string | null>(null);

  const isSignup = mode === 'signup';
  const pending = login.isPending || signup.isPending;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));
    const name = String(form.get('name') ?? '');

    try {
      if (isSignup) await signup.mutateAsync({ email, password, name: name || undefined });
      else await login.mutateAsync({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup ? 'Start proving what’s on your resume.' : 'Log in to continue.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {isSignup && <Input name="name" type="text" placeholder="Name (optional)" autoComplete="name" />}
        <Input name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <a href={googleLoginUrl()}>
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </a>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New to Intervio?{' '}
            <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
