// 4단계: 토너먼트 배틀 연출 — 대진표 · VS 충돌 · 스코어 공개 · 컨페티

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, ChevronRight, SkipForward, Crown } from 'lucide-react';
import type { Match, Option, Tournament } from '../types';
import { Button, CountUp, Confetti } from './ui';
import { cn, withAlpha } from '../utils';

type Phase = 'enter' | 'clash' | 'reveal';

interface PlayItem {
  roundIndex: number;
  match: Match;
}

export function ArenaBattle({
  tournament,
  options,
  onFinish,
}: {
  tournament: Tournament;
  options: Option[];
  onFinish: () => void;
}) {
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  // bye가 아닌 실제 경기만 순서대로 재생
  const playable = useMemo<PlayItem[]>(() => {
    const list: PlayItem[] = [];
    tournament.rounds.forEach((round, ri) => {
      round.forEach((m) => {
        if (!m.isBye && m.right) list.push({ roundIndex: ri, match: m });
      });
    });
    return list;
  }, [tournament]);

  const totalRounds = tournament.rounds.length;
  const [cursor, setCursor] = useState(0);
  const [phase, setPhase] = useState<Phase>('enter');
  const [finished, setFinished] = useState(playable.length === 0);
  const timers = useRef<number[]>([]);

  const current = playable[cursor];

  // 각 경기의 연출 타임라인: 입장 → 충돌 → 공개
  useEffect(() => {
    if (!current) return;
    setPhase('enter');
    timers.current.forEach(clearTimeout);
    timers.current = [];
    timers.current.push(window.setTimeout(() => setPhase('clash'), 700));
    timers.current.push(window.setTimeout(() => setPhase('reveal'), 1150));
    return () => timers.current.forEach(clearTimeout);
  }, [cursor, current]);

  function next() {
    if (cursor + 1 >= playable.length) {
      setFinished(true);
    } else {
      setCursor((c) => c + 1);
    }
  }

  function skipAll() {
    setFinished(true);
  }

  const winner = byId.get(tournament.winnerId);

  // 결승(마지막 경기) 공개 시 컨페티
  const isFinalReveal =
    !!current && cursor === playable.length - 1 && phase === 'reveal';

  return (
    <div className="mx-auto w-full max-w-4xl">
      <Confetti fire={isFinalReveal || finished} colors={options.map((o) => o.color)} />

      {/* 대진표 레일 */}
      <BracketRail tournament={tournament} byId={byId} activeCursor={cursor} playable={playable} finished={finished} />

      <AnimatePresence mode="wait">
        {!finished && current ? (
          <motion.div
            key={cursor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            <div className="mb-4 text-center">
              <span className="rounded-full border border-arena-line bg-arena-panel px-4 py-1.5 font-display text-sm tracking-wide text-neon">
                {roundName(current.roundIndex, totalRounds)} · {current.match.round + 1}라운드
              </span>
            </div>

            <ClashStage
              left={byId.get(current.match.leftOptionId)!}
              right={byId.get(current.match.rightOptionId)!}
              match={current.match}
              phase={phase}
            />

            <div className="mt-6 flex items-center justify-center gap-3">
              <Button variant="ghost" onClick={skipAll} magnetic={false}>
                <SkipForward className="h-4 w-4" /> 건너뛰고 결과
              </Button>
              <Button onClick={next} disabled={phase !== 'reveal'}>
                {cursor + 1 >= playable.length ? '우승 확정' : '다음 경기'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 text-center"
          >
            <Crown className="mx-auto mb-3 h-12 w-12 text-amber" />
            <p className="text-sm text-arena-muted">최종 우승</p>
            <h2
              className="my-2 break-keep font-display text-4xl sm:text-5xl"
              style={{ color: winner?.color }}
            >
              {winner?.name}
            </h2>
            <Button onClick={onFinish} className="mt-4 px-6 py-3.5 text-base">
              <Zap className="h-5 w-5" /> 결과 자세히 보기
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---- 스포트라이트 아래 두 카드가 충돌 ---- */
function ClashStage({
  left,
  right,
  match,
  phase,
}: {
  left: Option;
  right: Option;
  match: Match;
  phase: Phase;
}) {
  const leftWon = match.winnerId === left.id;
  const reveal = phase === 'reveal';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-arena-line bg-arena-bg2 p-5 sm:p-8">
      {/* 스포트라이트 */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[140%] w-[60%] -translate-x-1/2 opacity-60 blur-2xl"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(255,255,255,.14), transparent 60%)',
        }}
      />

      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <Fighter option={left} side="left" phase={phase} won={reveal && leftWon} lost={reveal && !leftWon} />

        <div className="flex flex-col items-center">
          <motion.div
            key={phase}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: phase === 'clash' ? 1.3 : 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
            className="font-display text-3xl text-danger sm:text-5xl"
          >
            VS
          </motion.div>
          {phase === 'clash' && (
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute h-16 w-16 rounded-full"
              style={{ background: 'radial-gradient(circle, #fff, transparent 65%)' }}
            />
          )}
        </div>

        <Fighter option={right} side="right" phase={phase} won={reveal && !leftWon} lost={reveal && leftWon} />
      </div>

      {/* 스코어보드 */}
      <AnimatePresence>
        {reveal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-6 flex items-center justify-center gap-4"
          >
            <ScorePill value={match.leftScore} color={left.color} win={leftWon} />
            {match.isClose && (
              <span className="rounded-full border border-amber/50 bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
                근소한 차이
              </span>
            )}
            <ScorePill value={match.rightScore} color={right.color} win={!leftWon} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fighter({
  option,
  side,
  phase,
  won,
  lost,
}: {
  option: Option;
  side: 'left' | 'right';
  phase: Phase;
  won: boolean;
  lost: boolean;
}) {
  const fromX = side === 'left' ? -120 : 120;
  return (
    <motion.div
      initial={{ x: fromX, opacity: 0 }}
      animate={{
        x: phase === 'clash' ? (side === 'left' ? 10 : -10) : 0,
        opacity: lost ? 0.35 : 1,
        scale: won ? 1.05 : lost ? 0.94 : 1,
        filter: lost ? 'grayscale(0.7)' : 'grayscale(0)',
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className={cn('relative rounded-2xl border-2 p-4 text-center sm:p-6', phase === 'clash' && 'animate-clash')}
      style={{
        borderColor: withAlpha(option.color, won ? 0.9 : 0.35),
        background: withAlpha(option.color, 0.08),
        boxShadow: won ? `0 0 40px -10px ${option.color}` : 'none',
      }}
    >
      {won && (
        <motion.span
          initial={{ scale: 0, y: -6 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          <Crown className="h-6 w-6 text-amber" fill="#ffb43b" />
        </motion.span>
      )}
      <span
        className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl font-display text-xl text-arena-bg sm:h-16 sm:w-16 sm:text-2xl"
        style={{ background: option.color }}
      >
        {option.name.trim().charAt(0) || '?'}
      </span>
      <div className="break-keep text-base font-bold leading-tight sm:text-lg">{option.name}</div>
    </motion.div>
  );
}

function ScorePill({ value, color, win }: { value: number; color: string; win: boolean }) {
  return (
    <div
      className={cn('rounded-xl px-4 py-1.5 font-score text-2xl font-bold sm:text-3xl', win && 'ring-2')}
      style={{
        color,
        background: withAlpha(color, 0.12),
        boxShadow: win ? `0 0 0 2px ${withAlpha(color, 0.6)}` : 'none',
      }}
    >
      <CountUp value={value} decimals={0} />
    </div>
  );
}

/* ---- 상단 대진표 레일 ---- */
function BracketRail({
  tournament,
  byId,
  activeCursor,
  playable,
  finished,
}: {
  tournament: Tournament;
  byId: Map<string, Option>;
  activeCursor: number;
  playable: PlayItem[];
  finished: boolean;
}) {
  // 현재까지 확정된 승자 집합
  const resolvedIds = useMemo(() => {
    const set = new Set<string>();
    const upto = finished ? playable.length : activeCursor;
    for (let i = 0; i < upto; i++) set.add(playable[i].match.winnerId);
    // bye는 항상 확정
    tournament.rounds.flat().forEach((m) => m.isBye && set.add(m.winnerId));
    return set;
  }, [tournament, activeCursor, playable, finished]);

  const activeMatch = !finished ? playable[activeCursor]?.match : undefined;

  return (
    <div className="overflow-x-auto rounded-2xl border border-arena-line bg-arena-panel/60 p-4">
      <div className="flex min-w-max gap-6">
        {tournament.rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col justify-around gap-3">
            <p className="mb-1 text-center font-display text-xs tracking-wide text-arena-muted">
              {roundName(ri, tournament.rounds.length)}
            </p>
            {round.map((m, mi) => (
              <div key={mi} className="flex flex-col gap-1">
                <BracketSlot option={byId.get(m.leftOptionId)} won={resolvedIds.has(m.leftOptionId) && m.winnerId === m.leftOptionId} decided={resolvedIds.has(m.winnerId)} active={activeMatch === m} bye={m.isBye} />
                {!m.isBye && (
                  <BracketSlot option={byId.get(m.rightOptionId)} won={resolvedIds.has(m.rightOptionId) && m.winnerId === m.rightOptionId} decided={resolvedIds.has(m.winnerId)} active={activeMatch === m} />
                )}
              </div>
            ))}
          </div>
        ))}
        {/* 우승 슬롯 */}
        <div className="flex flex-col justify-center">
          <p className="mb-1 text-center font-display text-xs tracking-wide text-amber">우승</p>
          <div
            className={cn(
              'grid h-12 min-w-[92px] place-items-center rounded-lg border px-3 text-sm font-bold',
              finished ? 'border-amber bg-amber/10 text-amber' : 'border-dashed border-arena-line2 text-arena-muted',
            )}
          >
            {finished ? byId.get(tournament.winnerId)?.name : '?'}
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketSlot({
  option,
  won,
  decided,
  active,
  bye,
}: {
  option?: Option;
  won: boolean;
  decided: boolean;
  active?: boolean;
  bye?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-9 min-w-[92px] items-center gap-2 rounded-lg border px-2 text-xs transition-colors',
        active && 'ring-2 ring-neon/60',
        decided && !won && 'opacity-40',
        won ? 'border-transparent font-bold' : 'border-arena-line',
      )}
      style={won && option ? { background: withAlpha(option.color, 0.16), color: option.color } : undefined}
    >
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: option?.color ?? '#2e3946' }} />
      <span className="truncate">{option?.name || '—'}</span>
      {bye && <span className="ml-auto text-[10px] text-arena-muted">부전승</span>}
    </div>
  );
}

/** 라운드 이름: 마지막은 결승, 그 앞은 준결승. */
function roundName(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return '결승';
  if (fromEnd === 1) return '준결승';
  if (fromEnd === 2) return '8강';
  return `${roundIndex + 1}라운드`;
}
