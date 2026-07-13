// 공유 카드 — 이미지처럼 보이는 결과 카드 · PNG 저장 · Web Share

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { X, Download, Share2, Crown, Loader2 } from 'lucide-react';
import type { Criterion, Option } from '../types';
import { Button } from './ui';
import { computeScore, breakdown } from '../scoring';
import { formatDate, withAlpha } from '../utils';

export function ShareCard({
  question,
  winner,
  criteria,
  summary,
  onClose,
}: {
  question: string;
  winner: Option;
  criteria: Criterion[];
  summary: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const score = computeScore(winner, criteria);
  const top = breakdown(winner, criteria).slice(0, 3);

  async function render(): Promise<Blob | null> {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: '#0a0d12',
    });
    const res = await fetch(dataUrl);
    return res.blob();
  }

  async function download() {
    try {
      setBusy(true);
      setNote(null);
      const blob = await render();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `decision-${winner.name || 'result'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setNote('이미지를 만들지 못했어요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    try {
      setBusy(true);
      setNote(null);
      const blob = await render();
      if (!blob) return;
      const file = new File([blob], 'decision.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
        await nav.share({ title: '오늘의 결정', text: `${question} → ${winner.name}`, files: [file] });
      } else if (nav.share) {
        await nav.share({ title: '오늘의 결정', text: `${question} → ${winner.name}` });
      } else {
        setNote('이 브라우저는 공유를 지원하지 않아 이미지 저장을 이용해 주세요.');
      }
    } catch {
      /* 사용자가 공유를 취소한 경우 등은 무시 */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm"
      >
        {/* 캡처 대상 카드 */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl border p-7"
          style={{
            borderColor: withAlpha(winner.color, 0.4),
            background: `radial-gradient(120% 90% at 50% 0%, ${withAlpha(winner.color, 0.18)}, #0d1117 55%)`,
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <span className="font-display text-sm tracking-widest text-neon">오늘의 결정</span>
            <span className="font-score text-xs text-arena-muted">{formatDate(Date.now())}</span>
          </div>

          <p className="mb-5 break-keep text-sm text-arena-muted">“{question}”</p>

          <div className="text-center">
            <Crown className="mx-auto mb-2 h-9 w-9 text-amber" fill="#ffb43b" />
            <div
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl text-arena-bg"
              style={{ background: winner.color }}
            >
              {winner.name.trim().charAt(0) || '?'}
            </div>
            <h3 className="mt-3 break-keep font-display text-3xl leading-tight" style={{ color: winner.color }}>
              {winner.name}
            </h3>
            <div className="mt-1 font-score text-xl font-bold">{score.toFixed(0)}점</div>
          </div>

          <p className="mt-5 break-keep text-center text-sm leading-relaxed text-arena-text">{summary}</p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {top.map((r) => (
              <span
                key={r.criterion.id}
                className="rounded-full border px-2.5 py-1 text-xs"
                style={{ borderColor: withAlpha(winner.color, 0.4), color: winner.color }}
              >
                {r.criterion.name} {r.raw}
              </span>
            ))}
          </div>

          <div className="mt-6 text-center font-score text-[10px] tracking-widest text-arena-muted">
            DECISION ARENA
          </div>
        </div>

        {note && <p className="mt-3 text-center text-xs text-amber">{note}</p>}

        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onClose} magnetic={false}>
            <X className="h-4 w-4" /> 닫기
          </Button>
          <Button variant="cyan" onClick={share} magnetic={false} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />} 공유
          </Button>
          <Button onClick={download} magnetic={false} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 이미지 저장
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
