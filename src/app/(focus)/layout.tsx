'use client';

import { useRequireAuth } from '@/lib/auth';
import { PageLoader } from '@/components/ui/page-loader';

/**
 * Distraction-free shell for the live interview: auth only, no sidebar, no
 * navbar. Same guard as AppShell, minus the chrome.
 */
export default function FocusLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireAuth();
  if (isLoading || !user) return <PageLoader fullscreen label="Loading…" />;
  return <div className="min-h-dvh bg-background">{children}</div>;
}
