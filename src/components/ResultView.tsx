// 5단계: 결과 — 우승 · 이유 · 기준별 분해 · 2위와의 차이

import { motion } from 'framer-motion';
import { RotateCcw, Pencil, Plus, Share2, Crown } from 'lucide-react';
import type { Criterion, Option } from '../types';
import { Button, Panel, CountUp, SplitTitle } from './ui';
import { breakdown, computeScore } from '../scoring';

export function ResultView({
  question,
  winner,
  runnerUp,
  criteria,
  summary,
  onRematch,
  onEditScores,
  onNew,
  onShare,
}: {
  question: string;
  winner: Option;
  runnerUp: Option | null;
  criteria: Criterion[];
  summary: string;
  onRematch: () => void;
  onEditScores: () => void;
  onNew: () => void;
  onShare: () => void;
}) {
  const winScore = computeScore(winner, criteria);
  const runnerScore = runnerUp ? computeScore(runnerUp, criteria) : 0;
  const gap = winScore - runnerScore;
  const rows = breakdown(winner, criteria);
  const maxWeighted = Math.max(...rows.map((r) => r.weighted), 1);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="mb-2 text-center text-sm text-arena-muted break-keep">“{question}”</p>

      <div className="text-center">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
          <Crown className="mx-auto h-14 w-14 text-amber" fill="#ffb43b" />
        </motion.div>
        <p className="mt-2 font-display text-sm tracking-widest text-neon">오늘의 결정</p>
        <h1 className="my-1 break-keep font-display text-5xl leading-tight sm:text-6xl" style={{ color: winner.color }}>
          <SplitTitle text={winner.name} />
        </h1>
        <div className="mt-2 font-score text-2xl font-bold text-arena-text">
          <CountUp value={winScore} decimals={0} duration={900} suffix="점" />
        </div>
      </div>

      <Panel className="mt-6 p-5 sm:p-6">
        <p className="text-lg leading-relaxed text-arena-text break-keep">{summary}</p>

        {runnerUp && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-arena-line bg-arena-panel2 px-4 py-3 text-sm">
            <span className="text-arena-muted">2위</span>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: runnerUp.color }} />
            <span className="font-semibold">{runnerUp.name}</span>
            <span className="ml-auto text-arena-muted">
              {gap < 2 ? '근소한 차이' : `+${gap.toFixed(0)}점 차이`}
            </span>
          </div>
        )}

        {/* 기준별 기여도 */}
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-arena-muted">기준별 기여도</p>
          {rows.map((r) => (
            <div key={r.criterion.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-arena-muted">{r.criterion.name}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-arena-line">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: winner.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(r.weighted / maxWeighted) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="w-14 text-right font-score text-sm">
                {r.raw}
                <span className="text-arena-muted">/10</span>
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button variant="ghost" onClick={onRematch} magnetic={false}>
          <RotateCcw className="h-4 w-4" /> 다시 겨루기
        </Button>
        <Button variant="ghost" onClick={onEditScores} magnetic={false}>
          <Pencil className="h-4 w-4" /> 점수 수정
        </Button>
        <Button variant="cyan" onClick={onShare} magnetic={false}>
          <Share2 className="h-4 w-4" /> 공유 카드
        </Button>
        <Button onClick={onNew} magnetic={false}>
          <Plus className="h-4 w-4" /> 새 고민
        </Button>
      </div>
    </div>
  );
}
