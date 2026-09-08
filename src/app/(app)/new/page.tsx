'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/app/page-header';
import { ChevronRightIcon, UploadIcon, FileIcon, XIcon } from '@/components/icons';
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
  const upload = useUploadResume();
  const createJd = useCreateJd();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitting = upload.isPending || createJd.isPending;

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
    if (jd && jd.length < 30)
      return setError('That job description looks too short — paste the full posting, or leave it blank.');

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
    <div className="mx-auto max-w-2xl">
      <PageHeader
        breadcrumb={
          <>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-foreground">New interview</span>
          </>
        }
        title="Analyze a resume"
        description="We'll pull out the claims worth defending, then put them to the test in an interview."
      />

      <div className="space-y-8">
        {/* Resume */}
        <div>
          <label className="mb-2 block text-sm font-medium">Resume</label>
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
              'grid cursor-pointer place-items-center rounded-xl border px-6 text-center transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              file
                ? 'border-border bg-card py-5'
                : dragging
                  ? 'border-dashed border-primary bg-primary/5 py-14'
                  : 'border-dashed border-border py-14 hover:border-primary/50',
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
              <div className="flex w-full items-center gap-3 text-left">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                  <FileIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSize(file.size)} · click to replace
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError(null);
                    if (inputRef.current) inputRef.current.value = '';
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                  <UploadIcon className="h-5 w-5" />
                </span>
                <p className="font-medium">Drop your resume here, or click to browse</p>
                <p className="mt-1 text-sm text-muted-foreground">PDF or DOCX · up to 5 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Target role */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor="jd" className="text-sm font-medium">
              Target role
            </label>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Optional
            </span>
          </div>
          <Textarea
            id="jd"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste a job description to tailor the interview to a specific role…"
            rows={6}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center">
          <Button onClick={onSubmit} loading={submitting} className="h-11 w-full px-5 text-[15px] sm:w-auto">
            {submitting ? 'Analyzing your resume…' : 'Analyze resume'}
          </Button>
          <span className="text-xs text-muted-foreground">
            Stored privately · analyzed in a few seconds.
          </span>
        </div>
      </div>
    </div>
  );
}
