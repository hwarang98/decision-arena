// 3단계: 점수 입력 — 직접 입력 / 자동 채우기 / 빠른 모드(1대1 선호)

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Swords,
  Dices,
  Zap,
  Pencil,
  Check,
  Trophy,
} from 'lucide-react';
import type { Criterion, Option } from '../types';
import { Button, Panel, TiltCard, CountUp } from './ui';
import { activeCriteria, computeScore, buildPairs, pairwiseToScores } from '../scoring';
import { cn, withAlpha } from '../utils';

type Mode = 'direct' | 'quick';

export function ScoringStep({
  options,
  criteria,
  onSetScore,
  onAutoFill,
  onApplyQuick,
  onBack,
  onStart,
}: {
  options: Option[];
  criteria: Criterion[];
  onSetScore: (optionId: string, criterionId: string, value: number) => void;
  onAutoFill: () => void;
  onApplyQuick: (opts: Option[]) => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const [mode, setMode] = useState<Mode>('direct');
  const active = activeCriteria(criteria);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium tracking-wide text-amber">
            <Swords className="h-4 w-4" /> STEP 3 · 점수 입력
          </p>
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">각 선택지에 점수를 매겨요</h2>
        </div>

        {/* 모드 전환 */}
        <div className="flex rounded-xl border border-arena-line bg-arena-panel2 p-1">
          <ModeTab active={mode === 'direct'} onClick={() => setMode('direct')} icon={<Pencil className="h-4 w-4" />}>
            직접 입력
          </ModeTab>
          <ModeTab active={mode === 'quick'} onClick={() => setMode('quick')} icon={<Zap className="h-4 w-4" />}>
            빠른 모드
          </ModeTab>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'direct' ? (
          <motion.div
            key="direct"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="mb-4 flex justify-end">
              <Button variant="ghost" onClick={onAutoFill} magnetic={false}>
                <Dices className="h-4 w-4" /> 대충 자동 채우기
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {options.map((o) => (
                <ScoreCard key={o.id} option={o} criteria={active} onSetScore={onSetScore} />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quick"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <QuickMode options={options} criteria={criteria} onApply={onApplyQuick} onSwitch={() => setMode('direct')} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> 이전
        </Button>
        <Button onClick={onStart} className="px-6 py-3.5 text-base">
          <Swords className="h-5 w-5" /> 아레나 시작
        </Button>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
        active ? 'bg-neon text-arena-bg' : 'text-arena-muted hover:text-arena-text',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---- 직접 입력 카드 ---- */
function ScoreCard({
  option,
  criteria,
  onSetScore,
}: {
  option: Option;
  criteria: Criterion[];
  onSetScore: (optionId: string, criterionId: string, value: number) => void;
}) {
  const score = computeScore(option, criteria);
  return (
    <TiltCard glareColor={option.color} max={5} className="rounded-2xl">
      <Panel className="overflow-hidden p-5" >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: option.color }} />
            <h3 className="text-lg font-bold">{option.name || '이름 없음'}</h3>
          </div>
          <div
            className="rounded-lg px-3 py-1 font-score text-xl font-bold"
            style={{ color: option.color, background: withAlpha(option.color, 0.12) }}
          >
            <CountUp value={score} decimals={0} suffix="점" />
          </div>
        </div>

        <div className="space-y-3">
          {criteria.map((c) => {
            const val = option.scores[c.id] ?? 5;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <span className="flex w-24 shrink-0 items-center gap-1 text-sm text-arena-muted">
                  {c.name}
                  <span
                    className="text-[10px]"
                    style={{ color: c.polarity === 'positive' ? '#2ff58f' : '#ffb43b' }}
                    title={c.polarity === 'positive' ? '높을수록 좋음' : '낮을수록 좋음'}
                  >
                    {c.polarity === 'positive' ? '▲' : '▼'}
                  </span>
                </span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={val}
                  onChange={(e) => onSetScore(option.id, c.id, Number(e.target.value))}
                  aria-label={`${option.name} — ${c.name} 점수`}
                  className="arena-range"
                  style={{ '--thumb': option.color } as React.CSSProperties}
                />
                <span className="w-6 text-right font-score font-bold">{val}</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </TiltCard>
  );
}

/* ---- 빠른 모드: 1대1 선호 ---- */
function QuickMode({
  options,
  criteria,
  onApply,
  onSwitch,
}: {
  options: Option[];
  criteria: Criterion[];
  onApply: (opts: Option[]) => void;
  onSwitch: () => void;
}) {
  const pairs = useMemo(() => buildPairs(options), [options]);
  const [idx, setIdx] = useState(0);
  const [wins, setWins] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const total = pairs.length;
  const pair = pairs[idx];

  function pick(winnerId: string) {
    setWins((w) => ({ ...w, [winnerId]: (w[winnerId] ?? 0) + 1 }));
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setIdx((i) => i + 1);
    }
  }

  function apply() {
    onApply(pairwiseToScores(options, wins, criteria));
    onSwitch();
  }

  if (done) {
    const ranked = options
      .map((o) => ({ o, w: wins[o.id] ?? 0 }))
      .sort((a, b) => b.w - a.w);
    return (
      <Panel className="p-6 text-center">
        <Trophy className="mx-auto mb-3 h-10 w-10 text-amber" />
        <h3 className="font-display text-2xl">빠른 비교 완료!</h3>
        <p className="mt-1 text-sm text-arena-muted">선호도를 점수로 환산했어요. 필요하면 직접 모드에서 다듬을 수 있어요.</p>
        <div className="mx-auto mt-5 max-w-sm space-y-2">
          {ranked.map(({ o, w }, i) => (
            <div key={o.id} className="flex items-center gap-3 rounded-lg border border-arena-line bg-arena-panel2 px-3 py-2">
              <span className="font-score text-sm text-arena-muted">{i + 1}</span>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} />
              <span className="flex-1 text-left font-semibold">{o.name}</span>
              <span className="font-score text-sm text-arena-muted">{w}승</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="ghost" onClick={() => { setIdx(0); setWins({}); setDone(false); }}>
            다시 비교
          </Button>
          <Button onClick={apply}>
            <Check className="h-4 w-4" /> 점수 적용
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="p-6">
      <div className="mb-5 text-center">
        <p className="text-sm text-arena-muted">
          더 끌리는 쪽을 골라요 · <b className="text-arena-text font-score">{idx + 1}</b> / {total}
        </p>
        <div className="mx-auto mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-arena-line">
          <motion.div
            className="h-full rounded-full bg-neon"
            animate={{ width: `${((idx) / total) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 sm:gap-5"
        >
          <PickCard option={pair[0]} onPick={() => pick(pair[0].id)} />
          <div className="flex items-center justify-center font-display text-2xl text-arena-muted sm:text-3xl">
            VS
          </div>
          <PickCard option={pair[1]} onPick={() => pick(pair[1].id)} />
        </motion.div>
      </AnimatePresence>

      <p className="mt-5 text-center text-xs text-arena-muted">
        모든 선택지를 짝지어 비교해요. 직접 점수를 매기고 싶다면 위에서 “직접 입력”을 선택하세요.
      </p>
    </Panel>
  );
}

function PickCard({ option, onPick }: { option: Option; onPick: () => void }) {
  return (
    <TiltCard glareColor={option.color} max={12} className="rounded-2xl">
      <motion.button
        type="button"
        onClick={onPick}
        whileTap={{ scale: 0.96 }}
        aria-label={`${option.name} 선택`}
        className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-arena-panel2 p-6 text-center transition-colors sm:p-8"
        style={{ borderColor: withAlpha(option.color, 0.4) }}
      >
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl font-display text-2xl text-arena-bg"
          style={{ background: option.color }}
        >
          {option.name.trim().charAt(0) || '?'}
        </span>
        <span className="break-keep text-lg font-bold leading-tight">{option.name}</span>
      </motion.button>
    </TiltCard>
  );
}
