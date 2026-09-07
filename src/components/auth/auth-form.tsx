'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin, useSignup, googleLoginUrl } from '@/lib/auth';
import { ApiError } from '@/lib/api';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.11-6.7-4.94H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.31a7.19 7.19 0 0 1 0-4.62V6.6H1.29a12 12 0 0 0 0 10.8l4.01-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.99 11.99 0 0 0 12 0 12 12 0 0 0 1.29 6.6l4.01 3.09C6.24 6.86 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

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
      <Link
        href="/"
        aria-label="Back to Intervio home"
        className="group fixed left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-2.5 py-1.5 text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
      >
        <Image src="/logo.png" alt="Intervio" width={20} height={20} />
        <span className="font-medium tracking-tight text-foreground">
          Intervio<span className="text-muted-foreground">.ai</span>
        </span>
        <span className="text-muted-foreground/50 transition-colors group-hover:text-muted-foreground/80">
          / home
        </span>
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup ? 'Start proving what’s on your resume.' : 'Log in to continue.'}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <Input name="email" type="email" placeholder="you@email.com" autoComplete="email" required />
        {isSignup && (
          <Input name="name" type="text" placeholder="Username (optional)" autoComplete="name" />
        )}
        <Input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" loading={pending}>
          {pending
            ? isSignup
              ? 'Signing you up…'
              : 'Logging you in…'
            : isSignup
              ? 'Sign up'
              : 'Log in'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR
        <span className="h-px flex-1 bg-border" />
      </div>

      <a href={googleLoginUrl()}>
        <Button variant="outline" className="w-full">
          <GoogleIcon className="h-4 w-4" />
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
