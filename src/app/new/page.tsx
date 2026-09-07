'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { useRequireAuth } from '@/lib/auth';
import { useUploadResume, useCreateJd } from '@/lib/resumes';
import { ApiError } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ['.pdf', '.docx'];

function isAccepted(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPT.some((ext) => name.endsWith(ext));
}

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function NewInterviewPage() {
  const router = useRouter();
  const { user, isLoading } = useRequireAuth();
  const upload = useUploadResume();
  const createJd = useCreateJd();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitting = upload.isPending || createJd.isPending;

  if (isLoading || !user) {
    return <main className="grid min-h-dvh place-items-center text-muted-foreground">Loading…</main>;
  }

  function pickFile(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!isAccepted(f)) return setError('Only PDF and DOCX files are supported.');
    if (f.size > MAX_BYTES) return setError('File is too large (max 5 MB).');
    setFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function onSubmit() {
    setError(null);
    if (!file) return setError('Add your resume first.');

    const jd = jdText.trim();
    if (jd && jd.length < 30) return setError('That job description looks too short — paste the full posting, or leave it blank.');

    try {
      let jdId: string | undefined;
      if (jd) {
        const res = await createJd.mutateAsync(jd);
        jdId = res.jd.id;
      }
      const { resume } = await upload.mutateAsync(file);
      router.push(`/resumes/${resume.id}${jdId ? `?jd=${jdId}` : ''}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Try again.');
    }
  }

  return (
    <div className="min-h-dvh">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">Analyze a resume</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume and we&apos;ll pull out the claims worth defending in an interview.
        </p>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            'mt-8 grid cursor-pointer place-items-center rounded-[var(--radius)] border border-dashed px-6 py-14 text-center transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="space-y-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatSize(file.size)} · click to replace</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-medium">Drop your resume here, or click to browse</p>
              <p className="text-sm text-muted-foreground">PDF or DOCX · up to 5 MB</p>
            </div>
          )}
        </div>

        {/* Optional JD */}
        <div className="mt-8">
          <label htmlFor="jd" className="text-sm font-medium">
            Target role <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <p className="mb-2 mt-1 text-sm text-muted-foreground">
            Paste a job description to tailor the questions to the role you&apos;re after.
          </p>
          <Textarea
            id="jd"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the job description here…"
            rows={5}
          />
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <Button onClick={onSubmit} disabled={submitting} className="mt-6 w-full sm:w-auto">
          {submitting ? (
            <>
              <Spinner /> Analyzing…
            </>
          ) : (
            'Analyze resume'
          )}
        </Button>
      </main>
    </div>
  );
}
