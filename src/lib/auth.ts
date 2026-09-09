'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, API_URL_PUBLIC } from '@/lib/api';
import type { PublicUser } from '@/lib/contracts';

interface MeResponse {
  user: PublicUser;
}

/** Current user, or null when unauthenticated. `isLoading` distinguishes "checking". */
export function useSession() {
  const query = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { user } = await api.get<MeResponse>('/auth/me');
        return user;
      } catch {
        return null;
      }
    },
  });
  return { user: query.data ?? null, isLoading: query.isLoading };
}

/** Redirect to /login once we know there's no session. Use on protected pages. */
export function useRequireAuth() {
  const router = useRouter();
  const { user, isLoading } = useSession();
  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);
  return { user, isLoading };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<MeResponse>('/auth/login', input),
    onSuccess: ({ user }) => qc.setQueryData(['session'], user),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string; name?: string }) =>
      api.post<MeResponse>('/auth/signup', input),
    onSuccess: ({ user }) => qc.setQueryData(['session'], user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => qc.setQueryData(['session'], null),
  });
}

/** Update editable profile fields (currently: name). Refreshes the cached session. */
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => api.patch<MeResponse>('/auth/me', input),
    onSuccess: ({ user }) => qc.setQueryData(['session'], user),
  });
}

/** Change password for email/password accounts (verifies the current password). */
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', input),
  });
}

/** Request a password-reset link. Always resolves (server never reveals if the email exists). */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.post('/auth/forgot-password', { email }),
  });
}

/** Complete a password reset with the emailed token. */
export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      api.post('/auth/reset-password', input),
  });
}

/** Full-page redirect to the backend's Google OAuth entry point. */
export function googleLoginUrl() {
  return `${API_URL_PUBLIC}/auth/google`;
}
