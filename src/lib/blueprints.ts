'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BlueprintWithClaims, Difficulty, Level } from '@/lib/contracts';

export interface BlueprintConfig {
  resumeId: string;
  jdId?: string;
  role: string;
  level: Level;
  difficulty: Difficulty;
  durationMin: number;
}

export function useCreateBlueprint() {
  return useMutation({
    mutationFn: (config: BlueprintConfig) => api.post<BlueprintWithClaims>('/blueprints', config),
  });
}

export function useBlueprint(id: string | undefined) {
  return useQuery({
    queryKey: ['blueprint', id],
    queryFn: () => api.get<BlueprintWithClaims>(`/blueprints/${id}`),
    enabled: Boolean(id),
  });
}
