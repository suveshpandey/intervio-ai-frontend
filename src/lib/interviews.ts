'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InterviewSummary, InterviewTranscript, Report, TurnResult } from '@/lib/contracts';

export function useStartInterview() {
  return useMutation({
    mutationFn: (blueprintId: string) => api.post<TurnResult>('/interviews', { blueprintId }),
  });
}

export function useSubmitAnswer(interviewId: string) {
  return useMutation({
    mutationFn: (input: { answer: string; turnSeconds: number }) =>
      api.post<TurnResult>(`/interviews/${interviewId}/answer`, input),
  });
}

/** Stop an interview part-way through. Idempotent, so double-clicking is harmless. */
export function useEndInterview(interviewId: string) {
  return useMutation({
    mutationFn: () => api.post<{ status: string }>(`/interviews/${interviewId}/end`),
  });
}

/** Full transcript — used for the summary once the interview ends. */
export function useTranscript(interviewId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => api.get<InterviewTranscript>(`/interviews/${interviewId}`),
    enabled,
  });
}

/**
 * The report for a finished interview. The backend builds it in the background
 * when the interview ends; this builds it on demand if that hasn't finished yet,
 * so the first request can take a few seconds.
 */
export function useReport(interviewId: string) {
  return useQuery({
    queryKey: ['report', interviewId],
    queryFn: () => api.get<{ report: Report }>(`/interviews/${interviewId}/report`),
    enabled: Boolean(interviewId),
    retry: false, // "too short" / "not finished" are answers, not failures
  });
}

/** Every interview this user has run — the sidebar history. */
export function useInterviews() {
  return useQuery({
    queryKey: ['interviews'],
    queryFn: () => api.get<{ interviews: InterviewSummary[] }>('/interviews'),
  });
}

/** Permanently delete an interview, its transcript and its report. */
export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<{ ok: true }>(`/interviews/${id}`),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}
