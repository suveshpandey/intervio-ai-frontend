'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/page-loader';
import { useTranscript } from '@/lib/interviews';
import { useBlueprint } from '@/lib/blueprints';
import { PcmPlayer } from '@/lib/audio-player';
import { connectVoice, type ServerMessage, type VoiceConnection } from '@/lib/voice-socket';
import { cn } from '@/lib/utils';
import type { PlanSection } from '@/lib/contracts';

/** The gateway streams the interviewer's voice as PCM16 at this rate. */
const TTS_SAMPLE_RATE = 24_000;

interface Exchange {
  question: string;
  answer: string | null;
}

export default function InterviewPage() {
  const interviewId = useParams<{ id: string }>().id;

  const transcript = useTranscript(interviewId, true);
  const blueprintId = transcript.data?.interview.blueprintId;
  const blueprint = useBlueprint(blueprintId);

  const [history, setHistory] = useState<Exchange[]>([]);
  const [question, setQuestion] = useState<string | null>(null);
  const [sectionKey, setSectionKey] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const conn = useRef<VoiceConnection | null>(null);
  const player = useRef<PcmPlayer | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // Seed the screen from the server once, so a refresh mid-interview resumes.
  useEffect(() => {
    if (hydrated.current || !transcript.data) return;
    hydrated.current = true;
    const { interview, turns } = transcript.data;
    const answered = turns.filter((t) => t.answer !== null);
    const pending = turns.find((t) => t.answer === null);
    setHistory(answered.map((t) => ({ question: t.question, answer: t.answer })));
    setQuestion(pending?.question ?? null);
    setSectionKey(pending?.sectionKey ?? turns.at(-1)?.sectionKey ?? '');
    setDone(interview.status === 'completed' || !pending);
  }, [transcript.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history.length, question, done]);

  // Tear down audio + socket when leaving the page.
  useEffect(
    () => () => {
      conn.current?.close();
      player.current?.close();
    },
    [],
  );

  const onMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'question':
        setThinking(false);
        setSpeaking(true);
        setQuestion(msg.text);
        setSectionKey(msg.sectionKey);
        break;
      case 'state':
        setSecondsLeft(msg.secondsLeft);
        setSectionKey(msg.sectionKey);
        break;
      case 'thinking':
        setThinking(true);
        break;
      case 'speech_end':
        setSpeaking(false);
        break;
      case 'done':
        setSpeaking(false);
        setThinking(false);
        setDone(true);
        break;
      case 'error':
        setError(msg.message);
        setThinking(false);
        setSpeaking(false);
        break;
      default:
        break;
    }
  }, []);

  /** Must run from a click — browsers block audio that isn't user-initiated. */
  async function begin() {
    setError(null);
    setConnecting(true);
    try {
      const p = new PcmPlayer(TTS_SAMPLE_RATE);
      await p.unlock();
      player.current = p;

      conn.current = await connectVoice(interviewId, {
        onMessage,
        onAudio: (chunk) => p.enqueue(chunk),
        onClose: () => setConnected(false),
      });
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the interview audio.');
    } finally {
      setConnecting(false);
    }
  }

  function send() {
    const answer = draft.trim();
    if (!answer || !conn.current || thinking || speaking) return;
    setHistory((h) => [...h, { question: question ?? '', answer }]);
    setQuestion(null);
    setDraft('');
    conn.current.sendText(answer);
  }

  if (transcript.isLoading) return <PageLoader label="Loading your interview…" />;
  if (transcript.error) return <p className="text-sm text-destructive">Couldn&apos;t load this interview.</p>;

  const sections: PlanSection[] = blueprint.data?.blueprint.sections ?? [];
  const sectionIdx = sections.findIndex((s) => s.key === sectionKey);
  const busy = thinking || speaking;

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl flex-col">
      {/* Status bar */}
      <div className="sticky top-16 z-10 -mx-6 mb-8 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-sm font-medium">
            {sections[sectionIdx]?.title ?? (done ? 'Finished' : 'Interview')}
          </span>
          <div className="flex shrink-0 items-center gap-3">
            {speaking && <SpeakingDots />}
            {secondsLeft !== null && !done && (
              <span className="font-mono text-xs text-muted-foreground">
                {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')} left
              </span>
            )}
          </div>
        </div>
        {sections.length > 0 && (
          <div className="mt-2 flex gap-1">
            {sections.map((s, i) => (
              <span
                key={s.key}
                title={s.title}
                style={{ flex: s.budgetMin }}
                className={cn(
                  'h-1 rounded-full transition-colors',
                  done || i < sectionIdx ? 'bg-primary/60' : i === sectionIdx ? 'bg-primary' : 'bg-border',
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Conversation */}
      <div className="flex-1 space-y-6">
        {history.map((x, i) => (
          <div key={i} className="space-y-2">
            {x.question && <p className="text-sm text-muted-foreground">{x.question}</p>}
            <div className="rounded-[var(--radius)] border border-border bg-card px-4 py-3 text-sm">
              {x.answer}
            </div>
          </div>
        ))}

        {question && (
          <div className="rounded-[var(--radius)] border border-primary/30 bg-primary/5 px-4 py-4">
            <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-primary/70">
              Interviewer {speaking && <span className="normal-case tracking-normal">· speaking</span>}
            </p>
            <p className="text-[15px] leading-relaxed">{question}</p>
          </div>
        )}

        {thinking && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="dash-line" style={{ width: 60 }} /> thinking…
          </p>
        )}

        {done && (
          <div className="rounded-[var(--radius)] border border-border bg-card p-6 text-center">
            <Badge tone="success">Interview complete</Badge>
            <p className="mt-3 text-sm text-muted-foreground">
              {history.length} question{history.length === 1 ? '' : 's'} answered. Your readiness
              report arrives in a later phase.
            </p>
            <Link href="/dashboard" className="mt-4 inline-block">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer / connect gate */}
      {!done && (
        <div className="sticky bottom-0 -mx-6 mt-8 border-t border-border bg-background/80 px-6 py-4 backdrop-blur-xl">
          {error && <p className="mb-2 text-sm text-destructive">{error}</p>}

          {!connected ? (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <Button onClick={begin} loading={connecting} className="h-11 px-6">
                {connecting ? 'Connecting…' : 'Begin interview'}
              </Button>
              <p className="font-mono text-[11px] text-muted-foreground/60">
                turn your sound on — the interviewer speaks the questions
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
                  }}
                  placeholder={busy ? 'Listen to the question…' : 'Type your answer…'}
                  rows={3}
                  disabled={busy}
                  className="min-h-[4.5rem]"
                />
                <Button onClick={send} disabled={busy || !draft.trim()}>
                  Send
                </Button>
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted-foreground/60">
                ⌘/Ctrl + Enter to send · speaking into the mic arrives next
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** Little equaliser so you can see the interviewer is talking. */
function SpeakingDots() {
  return (
    <span className="flex items-end gap-[2px]" aria-label="Interviewer speaking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="eq-bar h-3 w-[3px] rounded-full bg-primary"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
