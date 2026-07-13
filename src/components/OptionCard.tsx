// 선택지 입력 카드 — 이름 편집 · 삭제 · 틸트/글레어

import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';
import type { Option } from '../types';
import { TiltCard } from './ui';
import { withAlpha } from '../utils';

export function OptionCard({
  option,
  index,
  canDelete,
  onRename,
  onDelete,
}: {
  option: Option;
  index: number;
  canDelete: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -8 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className="min-w-0"
    >
      <TiltCard glareColor={option.color} max={8} className="min-w-0 rounded-2xl">
        <div
          className="group relative min-w-0 overflow-hidden rounded-2xl border bg-arena-panel2 p-3.5 sm:p-4"
          style={{
            borderColor: withAlpha(option.color, 0.35),
            boxShadow: `inset 0 1px 0 ${withAlpha(option.color, 0.15)}`,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: option.color }}
          />
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-score text-sm font-bold text-arena-bg"
              style={{ background: option.color }}
            >
              {index + 1}
            </span>
            <input
              value={option.name}
              onChange={(e) => onRename(option.id, e.target.value)}
              placeholder={`선택지 ${index + 1}`}
              aria-label={`선택지 ${index + 1} 이름`}
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-arena-text outline-none placeholder:text-arena-muted/60 sm:text-lg"
            />
            <GripVertical className="hidden h-4 w-4 text-arena-muted/50 sm:block" aria-hidden />
            <button
              type="button"
              onClick={() => onDelete(option.id)}
              disabled={!canDelete}
              aria-label={`선택지 ${option.name || index + 1} 삭제`}
              className="grid h-8 w-8 place-items-center rounded-lg text-arena-muted transition-colors hover:bg-danger/15 hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}
