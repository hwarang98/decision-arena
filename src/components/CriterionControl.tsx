// 기준 하나를 켜고/끄고 · 이름 편집 · 중요도 조절 · 방향 전환

import { motion } from 'framer-motion';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Criterion } from '../types';
import { CountUp } from './ui';
import { cn } from '../utils';

export function CriterionControl({
  criterion,
  onChange,
  onDelete,
}: {
  criterion: Criterion;
  onChange: (c: Criterion) => void;
  onDelete: (id: string) => void;
}) {
  const on = criterion.enabled;
  const accent = criterion.polarity === 'positive' ? '#2ff58f' : '#ffb43b';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border bg-arena-panel2 p-4 transition-colors',
        on ? 'border-arena-line2' : 'border-arena-line opacity-55',
      )}
    >
      <div className="flex items-center gap-3">
        {/* 활성 토글 */}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`${criterion.name} 기준 ${on ? '끄기' : '켜기'}`}
          onClick={() => onChange({ ...criterion, enabled: !on })}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            on ? 'bg-neon/80' : 'bg-arena-line2',
          )}
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full bg-arena-bg shadow',
              on ? 'left-[22px]' : 'left-0.5',
            )}
          />
        </button>

        <input
          value={criterion.name}
          onChange={(e) => onChange({ ...criterion, name: e.target.value })}
          aria-label="기준 이름"
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-arena-text outline-none"
        />

        {/* 방향 전환 (positive/negative) */}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...criterion,
              polarity: criterion.polarity === 'positive' ? 'negative' : 'positive',
            })
          }
          aria-label={`방향 전환 — 현재 ${
            criterion.polarity === 'positive' ? '높을수록 좋음' : '낮을수록 좋음'
          }`}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-arena-line px-2 py-1 text-xs font-medium"
          style={{ color: accent }}
        >
          {criterion.polarity === 'positive' ? (
            <>
              <TrendingUp className="h-3.5 w-3.5" /> 높을수록
            </>
          ) : (
            <>
              <TrendingDown className="h-3.5 w-3.5" /> 낮을수록
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => onDelete(criterion.id)}
          aria-label={`${criterion.name} 기준 삭제`}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-arena-muted hover:bg-danger/15 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* 중요도 슬라이더 */}
      <div className="mt-3 flex items-center gap-3 pl-14">
        <span className="w-16 shrink-0 text-xs text-arena-muted">중요도</span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={criterion.weight}
          disabled={!on}
          onChange={(e) => onChange({ ...criterion, weight: Number(e.target.value) })}
          aria-label={`${criterion.name} 중요도`}
          className="arena-range"
          style={
            { '--thumb': accent, '--track': '#232c37' } as React.CSSProperties
          }
        />
        <CountUp
          value={criterion.weight}
          duration={350}
          className="w-8 text-right font-score text-lg font-bold"
        />
      </div>
    </motion.div>
  );
}
