/**
 * Mic capture for the live interview.
 *
 * Runs on the browser's dedicated audio thread, so React re-renders can never
 * cause dropped samples. Each process() call hands us 128 frames (~2.7ms), which
 * is far too chatty for a WebSocket — so we resample to 16kHz, convert to PCM16,
 * and post ~100ms frames back to the main thread.
 *
 * Why 16kHz: speech consonants (s, f, th) carry energy up to 8kHz, and sampling
 * at 16k captures exactly that. It is also what Deepgram expects.
 */

/** ~100ms of audio per WebSocket frame. */
const FRAME_MS = 100;
/** Below this RMS a frame counts as silence. */
const SILENCE_RMS = 0.006;
/**
 * Keep sending silence for this long after speech stops. Deepgram's endpointing
 * NEEDS trailing silence to decide a turn ended — suppressing it outright means
 * utteranceEnd never fires and the interview stalls. Only long idle gaps are cut.
 */
const SILENCE_TAIL_MS = 3000;

class MicProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { targetSampleRate } = options.processorOptions;
    this.targetRate = targetSampleRate;
    // `sampleRate` is a global inside the worklet scope (the context's rate).
    this.ratio = sampleRate / this.targetRate;
    this.frameSamples = Math.round((this.targetRate * FRAME_MS) / 1000);

    this.out = new Float32Array(this.frameSamples);
    this.outIdx = 0;
    this.acc = 0;
    this.accCount = 0;
    this.pos = 0;
    this.silentMs = 0;
    this.muted = false;

    this.port.onmessage = (e) => {
      if (e.data?.type === 'mute') this.muted = true;
      if (e.data?.type === 'unmute') this.muted = false;
    };
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;

    for (let i = 0; i < channel.length; i++) {
      // Box-filter downsample: average the samples that collapse into one output
      // sample. Plain decimation would alias and hurt recognition.
      this.acc += channel[i];
      this.accCount++;
      this.pos++;

      if (this.pos >= this.ratio) {
        this.out[this.outIdx++] = this.acc / this.accCount;
        this.acc = 0;
        this.accCount = 0;
        this.pos -= this.ratio;

        if (this.outIdx >= this.frameSamples) {
          this.flush();
          this.outIdx = 0;
        }
      }
    }
    return true;
  }

  flush() {
    let sum = 0;
    for (let i = 0; i < this.frameSamples; i++) sum += this.out[i] * this.out[i];
    const rms = Math.sqrt(sum / this.frameSamples);

    if (rms < SILENCE_RMS) {
      this.silentMs += FRAME_MS;
    } else {
      this.silentMs = 0;
    }

    // Drop only *sustained* silence — the tail still goes through so Deepgram
    // can detect the end of a turn.
    if (this.muted || this.silentMs > SILENCE_TAIL_MS) return;

    const pcm = new Int16Array(this.frameSamples);
    for (let i = 0; i < this.frameSamples; i++) {
      const s = Math.max(-1, Math.min(1, this.out[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    this.port.postMessage({ pcm: pcm.buffer, rms }, [pcm.buffer]);
  }
}

registerProcessor('mic-processor', MicProcessor);
