// 2단계: 판단 기준 설정 (켜기/끄기 · 중요도 · 방향 · 추가)

import { AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, ArrowLeft, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import type { Criterion } from '../types';
import { CriterionControl } from './CriterionControl';
import { Button, Panel } from './ui';
import { activeCriteria } from '../scoring';

export function CriteriaStep({
  criteria,
  onChange,
  onDelete,
  onAdd,
  onBack,
  onNext,
}: {
  criteria: Criterion[];
  onChange: (c: Criterion) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const active = activeCriteria(criteria);
  const ready = active.length >= 1;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium tracking-wide text-cyan">
          <SlidersHorizontal className="h-4 w-4" /> STEP 2 · 기준 설정
        </p>
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">무엇을 중요하게 볼까요?</h2>
        <p className="mt-2 text-sm text-arena-muted">
          중요도가 높은 기준일수록 승패에 더 큰 영향을 줘요. 방향 버튼으로 “높을수록 좋음 / 낮을수록 좋음”을 바꿀 수 있어요.
        </p>
      </div>

      <Panel className="space-y-3 p-5 sm:p-6">
        <AnimatePresence mode="popLayout">
          {criteria.map((c) => (
            <CriterionControl key={c.id} criterion={c} onChange={onChange} onDelete={onDelete} />
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-arena-line2 py-3.5 text-arena-muted transition-colors hover:border-cyan/50 hover:text-cyan"
        >
          <Plus className="h-5 w-5" /> 기준 추가
        </button>
      </Panel>

      {!ready && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          활성화된 기준이 하나도 없어요. 최소 한 개는 켜 주세요.
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> 이전
        </Button>
        <Button variant="cyan" onClick={onNext} disabled={!ready}>
          점수 입력 <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
