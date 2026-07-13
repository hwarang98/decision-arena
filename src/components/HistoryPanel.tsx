// 최근 결정 기록 — localStorage 기반, hover 시 떠오름, 개별/전체 삭제

import { AnimatePresence, motion } from 'framer-motion';
import { Trash2, History, ArrowLeft, Inbox } from 'lucide-react';
import type { DecisionRecord } from '../types';
import { Button, Panel } from './ui';
import { formatDate, withAlpha } from '../utils';

export function HistoryPanel({
  records,
  onDelete,
  onClear,
  onBack,
}: {
  records: DecisionRecord[];
  onDelete: (id: string) => void;
  onClear: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium tracking-wide text-cyan">
            <History className="h-4 w-4" /> 결정 기록
          </p>
          <h2 className="font-display text-3xl">최근 내가 내린 결정들</h2>
        </div>
        {records.length > 0 && (
          <Button variant="danger" onClick={onClear} magnetic={false}>
            <Trash2 className="h-4 w-4" /> 전체 삭제
          </Button>
        )}
      </div>

      {records.length === 0 ? (
        <Panel className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-10 w-10 text-arena-muted" />
          <p className="text-arena-muted">아직 저장된 결정이 없어요. 아레나에서 첫 결정을 내려 보세요.</p>
        </Panel>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {records.map((r) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-4 rounded-2xl border border-arena-line bg-arena-panel2 p-4 transition-shadow hover:shadow-card"
              >
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg text-arena-bg"
                  style={{ background: r.winnerColor }}
                >
                  {r.winnerName.trim().charAt(0) || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-arena-muted">{r.question}</p>
                  <p className="truncate font-bold" style={{ color: r.winnerColor }}>
                    {r.winnerName}
                    <span className="ml-2 font-score text-sm text-arena-text">{r.winnerScore}점</span>
                  </p>
                </div>
                <span className="hidden shrink-0 font-score text-xs text-arena-muted sm:block">
                  {formatDate(r.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(r.id)}
                  aria-label={`${r.question} 기록 삭제`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-arena-muted hover:bg-danger/15 hover:text-danger"
                  style={{ background: withAlpha(r.winnerColor, 0.0) }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> 아레나로 돌아가기
        </Button>
      </div>
    </div>
  );
}
