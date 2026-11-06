'use client';

import { useLayoutEffect } from 'react';

/**
 * Pins the page to the light theme without touching the saved preference, and puts
 * the user's own choice back when they leave (e.g. landing → dashboard in dark).
 */
export function ForceLight() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = 'light';
    return () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {
        // storage blocked — fall back to light
      }
      root.dataset.theme = saved === 'dark' ? 'dark' : 'light';
    };
  }, []);

  return null;
}
