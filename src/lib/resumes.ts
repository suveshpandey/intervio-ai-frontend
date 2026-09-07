'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Resume, ResumeDetail, JobDescription } from '@/lib/contracts';

const ACTIVE: Set<Resume['parseStatus']> = new Set(['pending', 'processing']);

/** All of the current user's resumes, newest first. */
export function useResumes() {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get<{ resumes: Resume[] }>('/resumes'),
  });
}

/** One resume + its claims. Polls while parsing is still in flight. */
export function useResume(id: string) {
  return useQuery({
    queryKey: ['resume', id],
    queryFn: () => api.get<ResumeDetail>(`/resumes/${id}`),
    refetchInterval: (query) =>
      query.state.data && ACTIVE.has(query.state.data.resume.parseStatus) ? 1500 : false,
  });
}

export function useUploadResume() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.upload<{ resume: Resume }>('/resumes', form);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
}

export function useCreateJd() {
  return useMutation({
    mutationFn: (rawText: string) => api.post<{ jd: JobDescription }>('/jd', { rawText }),
  });
}

/** Optional job-description context, fetched only when an id is present. */
export function useJd(id: string | null) {
  return useQuery({
    queryKey: ['jd', id],
    queryFn: () => api.get<{ jd: JobDescription }>(`/jd/${id}`),
    enabled: Boolean(id),
  });
}
