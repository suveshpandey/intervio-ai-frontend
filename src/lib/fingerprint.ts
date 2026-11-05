/**
 * A device fingerprint for the daily usage quotas (backend common/device.ts).
 *
 * Built only from traits that stay put when cookies are cleared or a private
 * window is opened: screen, timezone, languages, hardware, and how this
 * machine's GPU and fonts render. Deliberately NOT the browser version, which
 * changes on every update. Hashed (SHA-256) before it leaves the page; it is
 * used only to count usage, never to identify anyone.
 */

let cached: Promise<string | null> | null = null;

/** The fingerprint hash, computed once per page load. null if it can't be built. */
export function getFingerprint(): Promise<string | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  cached ??= build().catch(() => null);
  return cached;
}

async function build(): Promise<string | null> {
  if (!crypto?.subtle) return null; // non-secure context
  const s = window.screen;
  const nav = navigator as Navigator & { deviceMemory?: number };

  const traits = [
    `${s.width}x${s.height}x${s.colorDepth}`,
    window.devicePixelRatio,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.languages?.join(',') ?? nav.language,
    nav.hardwareConcurrency,
    nav.deviceMemory ?? '',
    nav.maxTouchPoints,
    nav.platform,
    webglRenderer(),
    canvasSignature(),
  ].join('|');

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(traits));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** The GPU's vendor + renderer string: one of the most stable traits there is. */
function webglRenderer(): string {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return '';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext
      ? `${gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)}~${gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)}`
      : `${gl.getParameter(gl.VENDOR)}~${gl.getParameter(gl.RENDERER)}`;
  } catch {
    return '';
  }
}

/** Text + shapes drawn offscreen: the pixels differ with GPU, fonts and anti-aliasing. */
function canvasSignature(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '16px "Arial"';
    ctx.fillStyle = '#f60';
    ctx.fillRect(100, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Intervio, prove it! 😀', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Intervio, prove it! 😀', 4, 17);
    ctx.beginPath();
    ctx.arc(50, 30, 20, 0, Math.PI * 2);
    ctx.stroke();
    return canvas.toDataURL();
  } catch {
    return '';
  }
}
