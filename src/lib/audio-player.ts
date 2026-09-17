'use client';

/**
 * Plays the stream of PCM16 chunks the voice gateway sends.
 *
 * Chunks arrive faster than real time, so we can't just play each one on arrival —
 * that leaves audible gaps. Instead every chunk is scheduled to start exactly where
 * the previous one ends, which makes the speech continuous.
 */
/**
 * How long to wait before the first chunk of an utterance starts playing.
 *
 * Deepgram begins streaming only slightly faster than real time, with occasional
 * early gaps (measured: a 217ms stall after the third chunk), and the second hop
 * backend → browser adds its own jitter. Playing the first chunk instantly left
 * under ~50ms of slack, so the start of every question broke up into gaps.
 * Waiting briefly lets a cushion of audio queue up before sound begins.
 */
const PREBUFFER_SECONDS = 0.2;

export class PcmPlayer {
  private ctx: AudioContext | null = null;
  /** Where the next chunk should begin, on the AudioContext clock. */
  private nextStart = 0;
  private sources = new Set<AudioBufferSourceNode>();

  /**
   * Fires when the last queued chunk has actually finished PLAYING.
   * This is not the same as the server finishing sending: Deepgram streams faster
   * than real time, so the server is done 1-2.5s before the audio is.
   */
  onDrained?: () => void;

  constructor(private readonly sampleRate: number) {}

  /**
   * Must be called from a real user gesture — browsers refuse to start audio
   * otherwise, and the interview would be silent with no error.
   */
  async unlock(): Promise<void> {
    this.ctx ??= new AudioContext({ sampleRate: this.sampleRate });
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  get ready(): boolean {
    return this.ctx?.state === 'running';
  }

  enqueue(pcm: ArrayBuffer): void {
    const ctx = this.ctx;
    if (!ctx || pcm.byteLength < 2) return;

    // Int16 (−32768..32767) → Float32 (−1..1), which is what Web Audio wants.
    const ints = new Int16Array(pcm);
    const buffer = ctx.createBuffer(1, ints.length, this.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < ints.length; i++) channel[i] = ints[i]! / 32768;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    // Already playing → queue straight behind the previous chunk (gapless).
    // Starting fresh, or the buffer ran dry → wait briefly so a cushion builds up.
    const startAt =
      this.nextStart > ctx.currentTime ? this.nextStart : ctx.currentTime + PREBUFFER_SECONDS;
    source.start(startAt);
    this.nextStart = startAt + buffer.duration;

    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
      if (this.sources.size === 0) this.onDrained?.();
    };
  }

  /** True when nothing is queued or playing. */
  get drained(): boolean {
    return this.sources.size === 0;
  }

  /** Seconds of audio still queued — used to know when the interviewer has finished. */
  get pendingSeconds(): number {
    if (!this.ctx) return 0;
    return Math.max(0, this.nextStart - this.ctx.currentTime);
  }

  /** Cut playback immediately (interview ended, or the user left). */
  stop(): void {
    for (const s of this.sources) {
      // Detach first: a deliberate stop is not "the interviewer finished speaking".
      s.onended = null;
      try {
        s.stop();
      } catch {
        /* already finished */
      }
    }
    this.sources.clear();
    this.nextStart = 0;
  }

  close(): void {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}
