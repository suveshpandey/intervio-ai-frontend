'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { InterviewTranscript, TurnResult } from '@/lib/contracts';

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

/** Full transcript — used for the summary once the interview ends. */
export function useTranscript(interviewId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['interview', interviewId],
    queryFn: () => api.get<InterviewTranscript>(`/interviews/${interviewId}`),
    enabled,
  });
}
