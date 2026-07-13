// 순수 유틸 함수 모음 (도메인/React 비의존)

/** 조건부 className 결합. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** 충돌 확률이 낮은 짧은 id. */
export function uid(prefix = ''): string {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
}

/** min~max로 자른다. */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** min~max 정수 난수. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 배열을 얕게 섞는다(Fisher–Yates). */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 선택지 카드에 순환 배정할 네온 팔레트. */
export const OPTION_COLORS = [
  '#2ff58f', // neon green
  '#37d7ff', // cyan
  '#ffb43b', // amber
  '#ff5d7a', // pink-red
  '#a78bfa', // violet
  '#5eead4', // teal
  '#fca55d', // orange
  '#7dd3fc', // sky
];

export function pickColor(index: number): string {
  return OPTION_COLORS[index % OPTION_COLORS.length];
}

/** hex + 알파(0~1) → rgba 문자열. 그림자/글로우에 사용. */
export function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** timestamp → "2025.07.14" 형식. */
export function formatDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
}
