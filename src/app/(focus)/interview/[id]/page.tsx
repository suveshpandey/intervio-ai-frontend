'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageLoader } from '@/components/ui/page-loader';
import { KeyboardIcon, XIcon } from '@/components/icons';
import { TopBar } from '@/components/interview/top-bar';
import { ParticipantTile, type TileEffect, type TileStatus } from '@/components/interview/participant-tile';
import { CaptionBar } from '@/components/interview/caption-bar';
import { HearingNotice } from '@/components/interview/hearing-notice';
import { InterviewEnded } from '@/components/interview/interview-ended';
import { ControlBar } from '@/components/interview/control-bar';
import { useInterviewSession } from '@/lib/interview-session';
import { useSession } from '@/lib/auth';
import { useVoices } from '@/lib/voices';

/** Mic RMS above this, on the candidate's turn, counts as "talking" for the highlight. */
const TALKING_LEVEL = 0.02;
/** Typing is a dev tool and a mic-failure fallback, not a feature — keep it out of prod UI. */
const SHOW_TYPING_TOGGLE = process.env.NODE_ENV !== 'production';

function initialsOf(name: string | null | undefined, email: string): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/);
    return (parts[0]![0]! + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function InterviewRoom() {
  const interviewId = useParams<{ id: string }>().id;
  const s = useInterviewSession(interviewId);
  const { user } = useSession();
  const voices = useVoices();

  if (s.loading) return <PageLoader fullscreen label="Getting your interview ready…" />;
  if (s.loadError) {
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div>
          <p className="font-medium">We couldn&apos;t load this interview.</p>
          <Link href="/dashboard" className="mt-4 inline-block">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const interviewerName = voices.data?.voices.find((v) => v.id === s.voiceId)?.name ?? 'Interviewer';
  const firstName = user?.name?.trim().split(/\s+/)[0] || user?.email.split('@')[0] || 'You';
  const micReady = s.micState === 'ready';
  // The room opens when the interviewer starts talking, not when the socket
  // connects — in between, the server is still opening the speech streams.
  const inRoom = s.connected && s.started;
  const joining = s.connecting || (s.connected && !s.started && !s.done);

  // Whose turn is it?
  const yourTurn = inRoom && !s.done && !s.speaking && !s.thinking;
  const youTalking = yourTurn && micReady && !s.muted && (Boolean(s.interim) || s.micLevel > TALKING_LEVEL);

  const aiStatus: TileStatus = !inRoom
    ? { label: s.done ? 'Ended' : joining ? 'Getting ready' : 'Waiting to join', tone: 'neutral' }
    : s.speaking
      ? { label: 'Speaking', tone: 'accent', bars: true }
      : s.thinking
        ? { label: 'Thinking', tone: 'neutral' }
        : { label: 'Listening', tone: 'neutral' };
  const aiEffect: TileEffect = s.speaking ? 'ripple' : s.thinking || joining ? 'breathe' : null;

  const youStatus: TileStatus = !inRoom
    ? { label: 'Not joined', tone: 'neutral' }
    : s.micState === 'failed'
      ? { label: 'Mic unavailable', tone: 'muted' }
      : s.muted
        ? { label: 'Muted', tone: 'muted' }
        : s.micState === 'starting'
          ? { label: 'Starting mic…', tone: 'neutral' }
          : yourTurn
            ? { label: 'Your turn', tone: 'accent' }
            : { label: 'Listening to question', tone: 'neutral' };

  return (
    <div className="flex h-dvh flex-col">
      <TopBar
        role={s.role}
        sections={s.sections}
        sectionIdx={s.sectionIdx}
        secondsLeft={s.secondsLeft}
        live={inRoom}
        done={s.done}
      />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-5 sm:px-6">
        {s.error && (
          <div
            role="alert"
            className="flex w-full max-w-3xl items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <span>{s.error}</span>
            <button
              type="button"
              onClick={s.dismissError}
              aria-label="Dismiss"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* The two "cameras". */}
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
          <ParticipantTile
            variant="ai"
            name={interviewerName}
            subtitle="AI interviewer"
            initials={interviewerName[0]!.toUpperCase()}
            status={aiStatus}
            effect={aiEffect}
            active={s.speaking}
            dimmed={s.done}
          />
          <ParticipantTile
            variant="user"
            name={firstName}
            subtitle="You"
            initials={user ? initialsOf(user.name, user.email) : 'Y'}
            status={youStatus}
            effect={youTalking ? 'level' : null}
            level={s.micLevel}
            active={youTalking}
            dimmed={s.done || (inRoom && !yourTurn)}
            muted={inRoom && (s.muted || s.micState === 'failed')}
          />
        </div>

        {s.done ? (
          <InterviewEnded interviewId={interviewId} />
        ) : inRoom ? (
          <>
            <HearingNotice hearing={s.hearing} />
            <CaptionBar
              interviewerName={interviewerName}
              question={s.question}
              heard={s.heard}
              interim={s.interim}
              thinking={s.thinking}
            />
          </>
        ) : (
          <div className="max-w-md text-center">
            <p className="text-xl font-semibold tracking-tight">
              {joining ? `${interviewerName} is getting ready…` : 'Ready to join?'}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {joining ? (
                'This takes a few seconds — the first question is on its way.'
              ) : (
                <>
                  {interviewerName} will interview you
                  {s.durationMin ? ` for ${s.durationMin} minutes` : ''}. Turn your sound on — you&apos;ll
                  answer out loud.
                </>
              )}
            </p>
          </div>
        )}
      </main>

      {/* Controls */}
      {!s.done && (
        <footer className="flex shrink-0 flex-col items-center gap-3 px-4 pb-6">
          {inRoom && s.showTyping && (
            <form
              className="flex w-full max-w-xl items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                s.send();
              }}
            >
              <Input
                value={s.draft}
                onChange={(e) => s.setDraft(e.target.value)}
                placeholder={s.speaking || s.thinking ? 'Wait for the question…' : 'Type your answer…'}
                disabled={s.speaking || s.thinking}
                autoFocus
              />
              <Button type="submit" disabled={s.speaking || s.thinking || !s.draft.trim()}>
                Send
              </Button>
            </form>
          )}

          {inRoom ? (
            <ControlBar
              muted={s.muted}
              micAvailable={micReady}
              ending={s.ending}
              onToggleMute={s.toggleMute}
              onEnd={s.endNow}
            />
          ) : (
            <Button
              onClick={s.begin}
              loading={joining}
              disabled={joining}
              className="h-12 min-w-[13rem] rounded-full px-8 text-[15px]"
            >
              {s.connecting ? 'Connecting…' : joining ? 'Starting your interview…' : 'Join interview'}
            </Button>
          )}

          {inRoom && (SHOW_TYPING_TOGGLE || s.micState === 'failed') && (
            <button
              type="button"
              onClick={() => s.setShowTyping(!s.showTyping)}
              className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/60 transition-colors hover:text-foreground"
            >
              <KeyboardIcon className="h-3.5 w-3.5" />
              {s.showTyping ? 'hide typing' : 'type instead'}
            </button>
          )}
        </footer>
      )}
    </div>
  );
}
