// 1단계: 고민 질문 + 선택지 입력

import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Sparkles, ArrowRight, Swords } from 'lucide-react';
import type { Option } from '../types';
import { OptionCard } from './OptionCard';
import { Button, Panel, SplitTitle } from './ui';

export function SetupStep({
  question,
  options,
  onQuestion,
  onRename,
  onDelete,
  onAdd,
  onLoadExample,
  onNext,
}: {
  question: string;
  options: Option[];
  onQuestion: (v: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onLoadExample: () => void;
  onNext: () => void;
}) {
  const named = options.filter((o) => o.name.trim().length > 0);
  const ready = named.length >= 2;

  return (
    <div className="mx-auto w-full max-w-3xl min-w-0">
      <div className="mb-6">
        <p className="mb-2 flex min-w-0 items-center gap-2 text-sm font-medium tracking-wide text-neon">
          <Swords className="h-4 w-4" /> STEP 1 · 고민 입력
        </p>
        <h2 className="max-w-full break-words font-display text-2xl leading-tight min-[390px]:text-3xl sm:text-4xl">
          <SplitTitle text="무엇을 두고 고민 중인가요?" />
        </h2>
      </div>

      <Panel className="overflow-hidden p-4 sm:p-6">
        <label htmlFor="question" className="mb-2 block text-sm text-arena-muted">
          오늘의 고민
        </label>
        <input
          id="question"
          value={question}
          onChange={(e) => onQuestion(e.target.value)}
          placeholder="예: 오늘 뭐 먹지?"
          className="min-w-0 w-full rounded-xl border border-arena-line bg-arena-bg2 px-4 py-3 text-base font-semibold outline-none transition-colors focus:border-neon/60 sm:text-xl"
        />

        <div className="mt-6 mb-3 flex min-w-0 flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-arena-muted">
            선택지 <b className="text-arena-text">{named.length}</b>개
            <span className="ml-1 text-arena-muted/70">(최소 2개)</span>
          </span>
          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 text-sm text-cyan hover:underline"
          >
            <Sparkles className="h-4 w-4" /> 예시 불러오기
          </button>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {options.map((o, i) => (
              <OptionCard
                key={o.id}
                option={o}
                index={i}
                canDelete={options.length > 2}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          type="button"
          onClick={onAdd}
          whileTap={{ scale: 0.97 }}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-arena-line2 py-4 text-arena-muted transition-colors hover:border-neon/50 hover:text-neon"
        >
          <Plus className="h-5 w-5" /> 선택지 추가
        </motion.button>
      </Panel>

      <div className="mt-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0 text-sm text-arena-muted">
          {ready ? '좋아요. 이제 기준을 정할 차례예요.' : '이름 있는 선택지가 2개 이상 필요해요.'}
        </p>
        <Button onClick={onNext} disabled={!ready} className="w-full sm:w-auto">
          기준 설정 <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
