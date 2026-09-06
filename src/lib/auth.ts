'use client';

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

/** Full-page redirect to the backend's Google OAuth entry point. */
export function googleLoginUrl() {
  return `${API_URL_PUBLIC}/auth/google`;
}
