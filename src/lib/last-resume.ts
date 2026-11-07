'use client';

import { useInterviews } from '@/lib/interviews';
import { useResumes } from '@/lib/resumes';
import type { Resume } from '@/lib/contracts';

export interface LastResume {
  resume: Resume;
  /** The role it was last interviewed for, if it has been. */
  role: string | null;
  /** Where "continue" goes: the setup page, pre-filled with last time's choices. */
  href: string;
}

/**
 * The resume to continue with: the one from your latest interview, else your
 * newest ready resume. null while loading or when there is nothing ready.
 */
export function useLastResume(): LastResume | null {
  const resumes = useResumes().data?.resumes;
  const interviews = useInterviews().data?.interviews;
  if (!resumes || !interviews) return null;

  const ready = resumes.filter((r) => r.parseStatus === 'done');
  const latest = interviews.find((i) => ready.some((r) => r.id === i.resumeId));
  const resume =
    (latest && ready.find((r) => r.id === latest.resumeId)) || ready[0];
  if (!resume) return null;

  return {
    resume,
    role: latest?.role ?? null,
    href: `/resumes/${resume.id}/setup`,
  };
}
