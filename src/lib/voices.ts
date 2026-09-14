'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { VoiceOption } from '@/lib/contracts';

/** The curated interviewer voices. Rarely changes, so cache it for the session. */
export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: () => api.get<{ voices: VoiceOption[]; defaultVoice: string }>('/voices'),
    staleTime: Infinity,
  });
}
