'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranscript, useEndInterview } from '@/lib/interviews';
import { useBlueprint } from '@/lib/blueprints';
import { PcmPlayer } from '@/lib/audio-player';
import { MicRecorder } from '@/lib/audio-recorder';
import { connectVoice, type ServerMessage, type VoiceConnection } from '@/lib/voice-socket';
import type { PlanSection } from '@/lib/contracts';

/** The gateway streams the interviewer's voice as PCM16 at this rate. */
const TTS_SAMPLE_RATE = 24_000;

/**
 * Keep the mic closed briefly after the interviewer's audio ends, so the tail of
 * its voice through the speakers isn't picked up as the candidate's answer.
 */
const ECHO_TAIL_MS = 150;
/**
 * Safety net: if the player never reports it drained (e.g. the audio context was
 * suspended), still reopen the mic this long after the expected end of playback.
 * A mic stuck closed would look exactly like the interview hanging.
 */
const RELEASE_FALLBACK_MS = 1500;

/** `idle` = not joined yet; the lobby shows the tile before the mic is opened. */
export type MicState = 'idle' | 'starting' | 'ready' | 'failed';

/**
 * Everything the live interview needs: the socket, audio playback, the mic, and
 * the half-duplex hand-off between them. The page is pure layout on top of this.
 */
export function useInterviewSession(interviewId: string) {
  const router = useRouter();

  const transcript = useTranscript(interviewId, true);
  const blueprintId = transcript.data?.interview.blueprintId;
  const blueprint = useBlueprint(blueprintId);
  const endInterview = useEndInterview(interviewId);

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
  const [interim, setInterim] = useState('');
  const [micLevel, setMicLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [micState, setMicState] = useState<MicState>('idle');

  const conn = useRef<VoiceConnection | null>(null);
  const player = useRef<PcmPlayer | null>(null);
  const mic = useRef<MicRecorder | null>(null);
  /** Server finished sending this question's audio. */
  const speechEnded = useRef(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydrated = useRef(false);

  // Seed from the server once, so a refresh mid-interview resumes.
  useEffect(() => {
    if (hydrated.current || !transcript.data) return;
    hydrated.current = true;
    const { interview, turns } = transcript.data;
    const pending = turns.find((t) => t.answer === null);
    setQuestion(pending?.question ?? null);
    setSectionKey(pending?.sectionKey ?? turns.at(-1)?.sectionKey ?? '');
    setDone(interview.status !== 'live' || !pending);
  }, [transcript.data]);

  // Tear down audio + socket when leaving the page.
  useEffect(
    () => () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
      mic.current?.stop();
      conn.current?.close();
      player.current?.close();
    },
    [],
  );

  const clearRelease = useCallback(() => {
    if (releaseTimer.current) {
      clearTimeout(releaseTimer.current);
      releaseTimer.current = null;
    }
  }, []);

  /** Hand the floor back to the candidate (after a short echo tail). */
  const releaseMic = useCallback(() => {
    clearRelease();
    releaseTimer.current = setTimeout(() => {
      releaseTimer.current = null;
      setSpeaking(false);
    }, ECHO_TAIL_MS);
  }, [clearRelease]);

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case 'transcript':
          // Interim text is the live caption; finals are folded in by the gateway.
          setInterim(msg.isFinal ? '' : msg.text);
          break;
        case 'question':
          clearRelease();
          speechEnded.current = false;
          setThinking(false);
          setSpeaking(true);
          setInterim('');
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
        case 'speech_end': {
          // The server is done SENDING, but the browser is usually still playing
          // for another 1-2.5s. Reopening now would let the interviewer's own voice
          // into the mic. Wait for playback to drain (onDrained releases the mic).
          speechEnded.current = true;
          const p = player.current;
          if (!p || p.drained) {
            releaseMic();
          } else {
            clearRelease();
            releaseTimer.current = setTimeout(
              () => {
                releaseTimer.current = null;
                setSpeaking(false);
              },
              p.pendingSeconds * 1000 + RELEASE_FALLBACK_MS,
            );
          }
          break;
        }
        case 'done':
          clearRelease();
          setSpeaking(false);
          setThinking(false);
          setDone(true);
          break;
        case 'error':
          setError(msg.message);
          setThinking(false);
          // Only reopen if nothing is audibly playing; otherwise speech_end/onDrained will.
          if (!player.current || player.current.drained) setSpeaking(false);
          break;
        default:
          break;
      }
    },
    [clearRelease, releaseMic],
  );

  /**
   * Stop the interview now and go back to the plan.
   * Tears down locally first so nothing keeps talking or listening, then tells the
   * server over HTTP (reliable even if the socket has already dropped).
   */
  async function endNow() {
    clearRelease();
    mic.current?.stop();
    player.current?.stop();
    conn.current?.end();
    conn.current?.close();
    try {
      await endInterview.mutateAsync();
    } catch {
      /* Leaving anyway — an explicit end is idempotent server-side. */
    }
    const resumeId = blueprint.data?.blueprint.resumeId;
    router.push(resumeId ? `/review/${resumeId}` : '/dashboard');
  }

  /** Must run from a click — browsers block audio that isn't user-initiated. */
  async function begin() {
    setError(null);
    setConnecting(true);
    try {
      const p = new PcmPlayer(TTS_SAMPLE_RATE);
      await p.unlock();
      // The interviewer has truly finished talking only when playback drains AND
      // the server has said the utterance is complete (a mid-sentence buffer dip
      // also drains, and must not open the mic).
      p.onDrained = () => {
        if (speechEnded.current) releaseMic();
      };
      player.current = p;

      const c = await connectVoice(interviewId, {
        onMessage,
        onAudio: (chunk) => p.enqueue(chunk),
        onClose: () => setConnected(false),
      });
      conn.current = c;
      setConnected(true);

      // Mic failing is not fatal — the typed fallback still works, so we surface
      // the reason and carry on rather than killing the interview.
      setMicState('starting');
      try {
        const m = new MicRecorder({
          onFrame: (pcm) => c.sendAudio(pcm),
          onLevel: setMicLevel,
          onReady: (info) => c.sendMicInfo(info),
        });
        await m.start();
        mic.current = m;
        setMicState('ready');
      } catch (err) {
        setMicState('failed');
        setShowTyping(true);
        setError(err instanceof Error ? err.message : 'Microphone unavailable.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the interview audio.');
    } finally {
      setConnecting(false);
    }
  }

  /** Dev / mic-failure path: answer by typing. */
  function send() {
    const answer = draft.trim();
    if (!answer || !conn.current || thinking || speaking) return;
    setQuestion(null);
    setDraft('');
    conn.current.sendText(answer);
  }

  // Half-duplex: the mic is closed while the interviewer speaks, so it can
  // never hear its own voice, and reopens the moment it finishes.
  useEffect(() => {
    if (micState !== 'ready' || !mic.current) return;
    if (speaking || thinking || muted) mic.current.mute();
    else mic.current.unmute();
  }, [speaking, thinking, muted, micState]);

  const bp = blueprint.data?.blueprint;
  const sections: PlanSection[] = bp?.sections ?? [];

  return {
    loading: transcript.isLoading,
    loadError: Boolean(transcript.error),
    role: bp?.role ?? '',
    durationMin: bp?.durationMin ?? 0,
    voiceId: bp?.voice,
    sections,
    sectionIdx: sections.findIndex((s) => s.key === sectionKey),
    secondsLeft,
    question,
    interim,
    connected,
    connecting,
    speaking,
    thinking,
    done,
    error,
    micState,
    micLevel,
    muted,
    showTyping,
    draft,
    ending: endInterview.isPending,
    begin,
    endNow,
    send,
    setDraft,
    setShowTyping,
    toggleMute: () => setMuted((m) => !m),
    dismissError: () => setError(null),
  };
}
