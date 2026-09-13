'use client';

/**
 * Plays the stream of PCM16 chunks the voice gateway sends.
 *
 * Chunks arrive faster than real time, so we can't just play each one on arrival —
 * that leaves audible gaps. Instead every chunk is scheduled to start exactly where
 * the previous one ends, which makes the speech continuous.
 */
export class PcmPlayer {
  private ctx: AudioContext | null = null;
  /** Where the next chunk should begin, on the AudioContext clock. */
  private nextStart = 0;
  private sources = new Set<AudioBufferSourceNode>();

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

    // If we've fallen behind (network stall), restart from now rather than the past.
    const startAt = Math.max(this.nextStart, ctx.currentTime);
    source.start(startAt);
    this.nextStart = startAt + buffer.duration;

    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  /** Seconds of audio still queued — used to know when the interviewer has finished. */
  get pendingSeconds(): number {
    if (!this.ctx) return 0;
    return Math.max(0, this.nextStart - this.ctx.currentTime);
  }

  /** Cut playback immediately (interview ended, or the user left). */
  stop(): void {
    for (const s of this.sources) {
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
