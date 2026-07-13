// 재사용 UI 프리미티브: 마그네틱 버튼 · 틸트 카드 · CountUp · 타이틀 · 배경 · 컨페티

import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'framer-motion';
import { cn, withAlpha } from '../utils';

/* ------------------------------------------------------------------ *
 * Magnetic — 커서를 향해 살짝 끌려오는 래퍼
 * ------------------------------------------------------------------ */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * Button — 게임 UI 톤. variant별 컬러.
 * ------------------------------------------------------------------ */
type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: 'primary' | 'ghost' | 'danger' | 'cyan';
  magnetic?: boolean;
  full?: boolean;
};

export function Button({
  variant = 'primary',
  magnetic = true,
  full = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const styles: Record<string, string> = {
    primary:
      'bg-neon text-arena-bg font-bold hover:brightness-110 shadow-[0_10px_30px_-12px_rgba(47,245,143,.7)]',
    cyan: 'bg-cyan text-arena-bg font-bold hover:brightness-110 shadow-[0_10px_30px_-12px_rgba(55,215,255,.7)]',
    danger:
      'bg-transparent text-danger border border-danger/50 hover:bg-danger/10 font-semibold',
    ghost:
      'bg-arena-panel2 text-arena-text border border-arena-line hover:border-arena-line2 hover:bg-arena-panel font-semibold',
  };
  const btn = (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        full && 'w-full',
        styles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
  if (!magnetic) return btn;
  return <Magnetic className={full ? 'w-full' : undefined}>{btn}</Magnetic>;
}

/* ------------------------------------------------------------------ *
 * TiltCard — 마우스 위치에 따라 3D 기울기 + 글레어
 * ------------------------------------------------------------------ */
export function TiltCard({
  children,
  className,
  glareColor = '#ffffff',
  max = 10,
  disabled = false,
}: {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  max?: number;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 250, damping: 20 });
  const ry = useSpring(0, { stiffness: 250, damping: 20 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const [hover, setHover] = useState(false);

  function onMove(e: React.MouseEvent) {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }
  function leave() {
    rx.set(0);
    ry.set(0);
    setHover(false);
  }
  const glare = useTransform(
    [gx, gy] as never,
    ([xv, yv]: number[]) =>
      `radial-gradient(circle at ${xv}% ${yv}%, ${withAlpha(glareColor, 0.28)}, transparent 55%)`,
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={leave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      className={cn('relative [transform-style:preserve-3d]', className)}
    >
      {children}
      <motion.div
        aria-hidden
        style={{ background: glare, opacity: hover && !disabled ? 1 : 0 }}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ *
 * CountUp — 값 변화를 rAF로 부드럽게
 * ------------------------------------------------------------------ */
export function CountUp({
  value,
  decimals = 0,
  duration = 600,
  className,
  suffix = '',
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    cancelAnimationFrame(rafRef.current!);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [value, duration]);

  return (
    <span className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * SplitTitle — 글자 단위로 등장하는 헤드라인
 * ------------------------------------------------------------------ */
export function SplitTitle({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const chars = Array.from(text);
  return (
    <span className={cn('inline max-w-full whitespace-normal break-words', className)} aria-label={text}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={cn('inline-block', c === ' ' && 'w-2 sm:w-3')}
          initial={{ y: '0.5em', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: delay + i * 0.035, duration: 0.4, ease: 'easeOut' }}
        >
          {c === ' ' ? '\u00A0' : c}
        </motion.span>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * ArenaBackground — 은은한 격자 + 스포트라이트 스윕
 * ------------------------------------------------------------------ */
export function ArenaBackground({ intense = false }: { intense?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-arena-bg" />
      <div className="arena-grid absolute inset-0 opacity-60 animate-grid" />
      <div
        className={cn(
          'absolute left-1/2 top-[-30%] h-[80vh] w-[120vw] -translate-x-1/2 animate-spotlight blur-3xl',
          intense ? 'opacity-70' : 'opacity-40',
        )}
        style={{
          background:
            'conic-gradient(from 90deg at 50% 0%, rgba(47,245,143,.12), rgba(55,215,255,.08), rgba(255,180,59,.08), rgba(47,245,143,.12))',
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-t from-black/70 to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Confetti — 우승 순간 캔버스 파티클 버스트
 * ------------------------------------------------------------------ */
export function Confetti({ fire, colors }: { fire: boolean; colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';

    const N = 140;
    const parts = Array.from({ length: N }, () => {
      const angle = Math.random() * Math.PI - Math.PI / 2;
      const speed = (6 + Math.random() * 9) * dpr;
      return {
        x: W / 2,
        y: H * 0.32,
        vx: Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
        vy: Math.sin(angle) * speed - 6 * dpr,
        size: (4 + Math.random() * 6) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)] || '#2ff58f',
        life: 1,
      };
    });

    let raf = 0;
    const g = 0.35 * dpr;
    const start = performance.now();
    const loop = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const elapsed = now - start;
      for (const p of parts) {
        p.vy += g;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rot += p.vr;
        p.life = Math.max(0, 1 - elapsed / 2600);
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (elapsed < 2600) raf = requestAnimationFrame(loop);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fire, colors]);

  return (
    <canvas ref={ref} className="pointer-events-none fixed inset-0 z-40" aria-hidden />
  );
}

/* ------------------------------------------------------------------ *
 * Panel — 공통 카드 컨테이너
 * ------------------------------------------------------------------ */
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-2xl border border-arena-line bg-arena-panel/80 backdrop-blur-sm shadow-card',
        className,
      )}
    >
      {children}
    </div>
  );
}
