'use client';

import { api, API_URL_PUBLIC } from '@/lib/api';

/** Server → browser messages (mirrors backend src/contracts/voice.ts). */
export type ServerMessage =
  | { type: 'transcript'; text: string; isFinal: boolean }
  | { type: 'question'; text: string; turnIdx: number; sectionKey: string }
  | { type: 'speech_end' }
  | { type: 'state'; sectionKey: string; turnIdx: number; secondsLeft: number }
  | { type: 'thinking' }
  | { type: 'done' }
  | { type: 'error'; code: string; message: string };

export interface VoiceHandlers {
  onMessage(msg: ServerMessage): void;
  /** Raw PCM16 audio for the interviewer's voice. */
  onAudio(chunk: ArrayBuffer): void;
  onOpen?(): void;
  onClose?(): void;
}

/**
 * Connects to the interview voice gateway.
 *
 * A WebSocket can't carry an auth header, so we first exchange the cookie session
 * for a single-use 60s ticket and pass that in the query string.
 */
export async function connectVoice(
  interviewId: string,
  handlers: VoiceHandlers,
): Promise<VoiceConnection> {
  const { ticket } = await api.post<{ ticket: string }>(`/interviews/${interviewId}/voice-ticket`);

  const url = new URL(API_URL_PUBLIC);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/voice';
  url.searchParams.set('ticket', ticket);

  const ws = new WebSocket(url);
  ws.binaryType = 'arraybuffer';

  ws.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
      handlers.onAudio(event.data);
      return;
    }
    try {
      handlers.onMessage(JSON.parse(String(event.data)) as ServerMessage);
    } catch {
      /* ignore malformed frames */
    }
  };
  ws.onclose = () => handlers.onClose?.();

  await new Promise<void>((resolve, reject) => {
    ws.onopen = () => {
      handlers.onOpen?.();
      resolve();
    };
    ws.onerror = () => reject(new Error('Could not connect to the interview.'));
  });

  return new VoiceConnection(ws);
}

export class VoiceConnection {
  constructor(private readonly ws: WebSocket) {}

  /** Tell the server what the mic actually produced, so a rate mismatch is visible. */
  sendMicInfo(info: { contextSampleRate: number; targetSampleRate: number }): void {
    this.send({ type: 'mic_info', ...info });
  }

  /** Dev path: answer by typing instead of speaking. */
  sendText(text: string): void {
    this.send({ type: 'text_answer', text });
  }

  /** Mic audio frame (used once mic capture lands). */
  sendAudio(frame: ArrayBuffer): void {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(frame);
  }

  end(): void {
    this.send({ type: 'end' });
  }

  close(): void {
    this.ws.close();
  }

  private send(msg: unknown): void {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }
}
