'use client';

import { useEffect, useRef } from 'react';

interface Dot {
  /** Home position, drifting slowly. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Displacement from home and its velocity — the spring the cursor pushes on. */
  ox: number;
  oy: number;
  ovx: number;
  ovy: number;
  r: number;
  a: number;
  /** 0.3 (far, small) – 1 (near, big): how far the cursor carries this dot. */
  z: number;
}

const RADIUS = 340;
const PUSH = 1100; // px/s² at the cursor's centre; a dot there ends up PUSH / STIFFNESS ≈ 200px away
const PARALLAX = 150; // px a near dot is carried across the hero as the cursor goes edge to edge
const STIFFNESS = 5.5; // pull back to home — low, so dots travel far and drift back slowly
const DAMPING = 4.4; // just under critical (2·√5.5 ≈ 4.7): a long, soft settle with no wobble

/**
 * Sparse dots drifting behind the hero. The cursor is eased (never jumps), pushes dots
 * through a smooth falloff, and each dot springs back — all integrated per second, so
 * it moves the same at any frame rate. Static under reduced motion, paused off-screen.
 */
export function HeroParticles({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#103a63';
    // target = where the cursor is; (x, y) = the eased point the dots actually react to.
    const pointer = { tx: 0, ty: 0, x: 0, y: 0, strength: 0, target: 0 };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 11000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 11,
        vy: (Math.random() - 0.5) * 11,
        ox: 0,
        oy: 0,
        ovx: 0,
        ovy: 0,
        r: 0.8 + Math.random() * 1.6,
        a: 0.18 + Math.random() * 0.4,
        z: 0,
      }));
      for (const d of dots) d.z = 0.3 + ((d.r - 0.8) / 1.6) * 0.7;
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      for (const d of dots) {
        ctx.globalAlpha = d.a;
        ctx.beginPath();
        ctx.arc(d.x + d.ox, d.y + d.oy, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const step = (dt: number) => {
      // Ease the cursor toward its target, and fade its influence in and out.
      const ease = 1 - Math.exp(-dt * 7);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.strength += (pointer.target - pointer.strength) * (1 - Math.exp(-dt * 4));

      // Cursor position across the canvas, -1…1, fading to 0 when the cursor leaves.
      const nx = Math.max(-1, Math.min(1, (pointer.x - w / 2) / (w / 2))) * pointer.strength;
      const ny = Math.max(-1, Math.min(1, (pointer.y - h / 2) / (h / 2))) * pointer.strength;

      for (const d of dots) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < -6) d.x = w + 6;
        else if (d.x > w + 6) d.x = -6;
        if (d.y < -6) d.y = h + 6;
        else if (d.y > h + 6) d.y = -6;

        // Where this dot wants to sit: carried along with the cursor, deeper dots further.
        const hx = nx * PARALLAX * d.z;
        const hy = ny * PARALLAX * d.z;
        let fx = -STIFFNESS * (d.ox - hx) - DAMPING * d.ovx;
        let fy = -STIFFNESS * (d.oy - hy) - DAMPING * d.ovy;

        if (pointer.strength > 0.001) {
          const dx = d.x + d.ox - pointer.x;
          const dy = d.y + d.oy - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS && dist > 0.001) {
            const t = 1 - dist / RADIUS;
            const falloff = t * t * (3 - 2 * t); // smoothstep: no hard edge at the radius
            const f = PUSH * falloff * pointer.strength;
            fx += (dx / dist) * f;
            fy += (dy / dist) * f;
          }
        }

        d.ovx += fx * dt;
        d.ovy += fy * dt;
        d.ox += d.ovx * dt;
        d.oy += d.ovy * dt;
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      // Clamp so a background tab or hiccup can't launch the dots.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!visible || document.hidden) return;
      step(dt);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // First contact: start where the cursor is instead of gliding in from the corner.
      if (pointer.target === 0) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.tx = x;
      pointer.ty = y;
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    size();
    draw();
    if (!reduce) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
