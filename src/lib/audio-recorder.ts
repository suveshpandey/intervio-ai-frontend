'use client';

/** Deepgram expects 16kHz mono PCM16 for speech recognition. */
export const MIC_SAMPLE_RATE = 16_000;

export interface MicInfo {
  /** What the browser actually gave us (may differ from the 16k we asked for). */
  contextSampleRate: number;
  targetSampleRate: number;
}

export interface RecorderHandlers {
  /** A ~100ms PCM16 frame, ready to put on the wire. */
  onFrame(pcm: ArrayBuffer): void;
  /** 0–1 loudness, for the mic level meter. */
  onLevel?(rms: number): void;
  /** Fired once the audio graph is running, with the real device settings. */
  onReady?(info: MicInfo): void;
}

export class MicRecorder {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: AudioWorkletNode | null = null;

  constructor(private readonly handlers: RecorderHandlers) {}

  /**
   * Asks for the microphone and starts streaming frames.
   * Throws a human-readable error if permission is denied or no mic exists —
   * the caller shows it, because a silent failure here looks like a broken app.
   */
  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      throw new Error(micErrorMessage(err));
    }

    // Ask for 16kHz directly; browsers that refuse just give their native rate
    // and the worklet resamples using the real ratio.
    this.ctx = new AudioContext({ sampleRate: MIC_SAMPLE_RATE });
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    await this.ctx.audioWorklet.addModule('/worklets/mic-processor.js');

    this.node = new AudioWorkletNode(this.ctx, 'mic-processor', {
      numberOfInputs: 1,
      numberOfOutputs: 0,
      processorOptions: { targetSampleRate: MIC_SAMPLE_RATE },
    });

    this.node.port.onmessage = (e: MessageEvent<{ pcm: ArrayBuffer; rms: number }>) => {
      this.handlers.onFrame(e.data.pcm);
      this.handlers.onLevel?.(e.data.rms);
    };

    this.ctx.createMediaStreamSource(this.stream).connect(this.node);

    this.handlers.onReady?.({
      contextSampleRate: this.ctx.sampleRate,
      targetSampleRate: MIC_SAMPLE_RATE,
    });
  }

  /** Stop sending without dropping the mic (used while the interviewer speaks). */
  mute(): void {
    this.node?.port.postMessage({ type: 'mute' });
  }

  unmute(): void {
    this.node?.port.postMessage({ type: 'unmute' });
  }

  stop(): void {
    this.node?.port.close();
    this.node?.disconnect();
    this.stream?.getTracks().forEach((t) => t.stop());
    void this.ctx?.close();
    this.node = null;
    this.stream = null;
    this.ctx = null;
  }
}

function micErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name;
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Microphone access was blocked. Allow it in your browser settings, then try again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No microphone found. Plug one in and try again.';
    case 'NotReadableError':
      return 'Your microphone is in use by another app. Close it and try again.';
    default:
      return 'Could not start the microphone.';
  }
}
