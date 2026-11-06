import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Intervio: AI mock interviews about your real work',
  description:
    'Practise a real, spoken technical interview in your browser. Intervio asks about the work on your resume, follows up like a real interviewer, and tells you how ready you are.',
};

// Applied before paint to avoid a theme flash. Light unless the user chose dark; the
// landing and auth pages are always light (ForceLight covers client-side navigation).
const THEME_INIT = `try{var p=location.pathname,pub=p==='/'||/^\\/(login|signup|forgot-password|reset-password)(\\/|$)/.test(p),t=localStorage.getItem('theme');document.documentElement.dataset.theme=(!pub&&t==='dark')?'dark':'light';}catch(e){document.documentElement.dataset.theme='light';}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
