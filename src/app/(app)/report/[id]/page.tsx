'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/page-loader';

/**
 * The report now lives as a tab on the interview page. Kept so links handed out
 * earlier (and the old "see your report" button) still land somewhere sensible.
 */
export default function ReportRedirect() {
  const interviewId = useParams<{ id: string }>().id;
  const router = useRouter();

  useEffect(() => {
    router.replace(`/interviews/${interviewId}?tab=report`);
  }, [interviewId, router]);

  return <PageLoader label="Opening your report…" />;
}
