// Decision Arena — 상태 오케스트레이션 & 화면 전환

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Swords } from 'lucide-react';
import type { Criterion, DecisionRecord, Option, Step, Tournament } from './types';
import {
  defaultCriteria,
  makeOption,
  seedOptions,
  blankOptions,
  SEED_QUESTION,
  EXTRA_CRITERIA_PRESETS,
} from './data';
import { runTournament, generateSummary, computeScore } from './scoring';
import { loadRecords, saveRecords, prependRecord } from './storage';
import { uid, shuffle } from './utils';

import { ArenaBackground } from './components/ui';
import { SetupStep } from './components/SetupStep';
import { CriteriaStep } from './components/CriteriaStep';
import { ScoringStep } from './components/ScoringStep';
import { ArenaBattle } from './components/ArenaBattle';
import { ResultView } from './components/ResultView';
import { HistoryPanel } from './components/HistoryPanel';
import { ShareCard } from './components/ShareCard';

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: 'setup', label: '고민' },
  { key: 'criteria', label: '기준' },
  { key: 'scoring', label: '점수' },
];

export default function App() {
  const [step, setStep] = useState<Step>('setup');
  const [prevInputStep, setPrevInputStep] = useState<Step>('setup');
  const [question, setQuestion] = useState('');
  const [criteria, setCriteria] = useState<Criterion[]>(() => defaultCriteria());
  const [options, setOptions] = useState<Option[]>(() => blankOptions(defaultCriteria()));
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [competitors, setCompetitors] = useState<Option[]>([]);
  const [summary, setSummary] = useState('');
  const [records, setRecords] = useState<DecisionRecord[]>([]);
  const [showShare, setShowShare] = useState(false);

  // 기록 로드
  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  /* ---------- setup ---------- */
  function addOption() {
    setOptions((prev) => [...prev, makeOption('', prev.length, criteria)]);
  }
  function renameOption(id: string, name: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, name } : o)));
  }
  function deleteOption(id: string) {
    setOptions((prev) => (prev.length > 2 ? prev.filter((o) => o.id !== id) : prev));
  }
  function loadExample() {
    const c = defaultCriteria();
    setCriteria(c);
    setQuestion(SEED_QUESTION);
    setOptions(seedOptions(c));
  }

  /* ---------- criteria ---------- */
  function changeCriterion(next: Criterion) {
    setCriteria((prev) => prev.map((c) => (c.id === next.id ? next : c)));
  }
  function deleteCriterion(id: string) {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
    // 선택지 점수에서도 제거
    setOptions((prev) =>
      prev.map((o) => {
        const { [id]: _drop, ...rest } = o.scores;
        return { ...o, scores: rest };
      }),
    );
  }
  function addCriterion() {
    const used = new Set(criteria.map((c) => c.name));
    const preset = EXTRA_CRITERIA_PRESETS.find((p) => !used.has(p)) ?? '새 기준';
    const newC: Criterion = {
      id: uid('c_'),
      name: preset,
      weight: 5,
      enabled: true,
      polarity: 'positive',
    };
    setCriteria((prev) => [...prev, newC]);
    setOptions((prev) => prev.map((o) => ({ ...o, scores: { ...o.scores, [newC.id]: 5 } })));
  }

  /* ---------- scoring ---------- */
  function setScore(optionId: string, criterionId: string, value: number) {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId ? { ...o, scores: { ...o.scores, [criterionId]: value } } : o,
      ),
    );
  }
  function autoFill() {
    setOptions((prev) =>
      prev.map((o) => {
        const scores: Record<string, number> = { ...o.scores };
        for (const c of criteria) scores[c.id] = 1 + Math.floor(Math.random() * 10);
        return { ...o, scores };
      }),
    );
  }
  function applyQuick(next: Option[]) {
    setOptions(next);
  }

  /* ---------- battle ---------- */
  const namedOptions = useMemo(
    () => options.filter((o) => o.name.trim().length > 0),
    [options],
  );

  function startBattle() {
    const field = shuffle(namedOptions); // 시딩을 섞어 대진을 다양화
    const t = runTournament(field, criteria);
    setCompetitors(field);
    setTournament(t);
    setStep('battle');
  }

  function finishBattle() {
    if (!tournament) return;
    const winner = competitors.find((o) => o.id === tournament.winnerId) ?? competitors[0];
    const runnerUp = tournament.runnerUpId
      ? competitors.find((o) => o.id === tournament.runnerUpId) ?? null
      : null;
    const text = generateSummary(winner, runnerUp, criteria);
    setSummary(text);

    // 기록 저장
    const rec: DecisionRecord = {
      id: uid('r_'),
      question: question.trim() || '무제 고민',
      winnerName: winner.name,
      winnerColor: winner.color,
      winnerScore: Math.round(computeScore(winner, criteria)),
      runnerUpName: runnerUp?.name ?? null,
      createdAt: Date.now(),
      summary: text,
    };
    setRecords((prev) => {
      const nextRecords = prependRecord(prev, rec);
      saveRecords(nextRecords);
      return nextRecords;
    });

    setStep('result');
  }

  function rematch() {
    const field = shuffle(competitors.length ? competitors : namedOptions);
    setCompetitors(field);
    setTournament(runTournament(field, criteria));
    setStep('battle');
  }

  function newDecision() {
    const c = defaultCriteria();
    setCriteria(c);
    setQuestion('');
    setOptions(blankOptions(c));
    setTournament(null);
    setCompetitors([]);
    setSummary('');
    setStep('setup');
  }

  /* ---------- history ---------- */
  function openHistory() {
    setPrevInputStep(step === 'history' ? 'setup' : step);
    setStep('history');
  }
  function deleteRecord(id: string) {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveRecords(next);
      return next;
    });
  }
  function clearRecords() {
    setRecords([]);
    saveRecords([]);
  }

  const winner =
    tournament && competitors.find((o) => o.id === tournament.winnerId)
      ? competitors.find((o) => o.id === tournament.winnerId)!
      : null;
  const runnerUp =
    tournament?.runnerUpId != null
      ? competitors.find((o) => o.id === tournament.runnerUpId) ?? null
      : null;

  const showStepper = step === 'setup' || step === 'criteria' || step === 'scoring';
  const activeIntense = step === 'battle' || step === 'result';

  return (
    <div className="relative min-h-screen min-w-0 overflow-x-hidden">
      <ArenaBackground intense={activeIntense} />

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-arena-line/60 bg-arena-bg/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl min-w-0 items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={newDecision}
            className="flex min-w-0 items-center gap-2"
            aria-label="Decision Arena 홈"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-neon text-arena-bg">
              <Swords className="h-5 w-5" />
            </span>
            <span className="truncate font-display text-base tracking-tight min-[390px]:text-lg">
              DECISION <span className="text-neon">ARENA</span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            {showStepper && (
              <nav aria-label="진행 단계" className="hidden items-center gap-2 sm:flex">
                {STEP_LABELS.map((s, i) => {
                  const activeIdx = STEP_LABELS.findIndex((x) => x.key === step);
                  const state = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'todo';
                  return (
                    <div key={s.key} className="flex items-center gap-2">
                      <span
                        className={
                          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ' +
                          (state === 'active'
                            ? 'bg-neon/15 text-neon'
                            : state === 'done'
                              ? 'text-arena-text'
                              : 'text-arena-muted')
                        }
                      >
                        <span
                          className={
                            'grid h-4 w-4 place-items-center rounded-full font-score text-[10px] ' +
                            (state === 'todo' ? 'bg-arena-line text-arena-muted' : 'bg-neon text-arena-bg')
                          }
                        >
                          {i + 1}
                        </span>
                        {s.label}
                      </span>
                      {i < STEP_LABELS.length - 1 && <span className="h-px w-4 bg-arena-line" />}
                    </div>
                  );
                })}
              </nav>
            )}
            <button
              type="button"
              onClick={openHistory}
              className="relative flex items-center gap-1.5 rounded-lg border border-arena-line bg-arena-panel2 px-3 py-2 text-sm text-arena-text transition-colors hover:border-cyan/50"
              aria-label="결정 기록 보기"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">기록</span>
              {records.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cyan px-1 font-score text-[11px] font-bold text-arena-bg">
                  {records.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto w-full max-w-5xl min-w-0 px-4 py-6 sm:px-6 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {step === 'setup' && (
              <SetupStep
                question={question}
                options={options}
                onQuestion={setQuestion}
                onRename={renameOption}
                onDelete={deleteOption}
                onAdd={addOption}
                onLoadExample={loadExample}
                onNext={() => setStep('criteria')}
              />
            )}

            {step === 'criteria' && (
              <CriteriaStep
                criteria={criteria}
                onChange={changeCriterion}
                onDelete={deleteCriterion}
                onAdd={addCriterion}
                onBack={() => setStep('setup')}
                onNext={() => setStep('scoring')}
              />
            )}

            {step === 'scoring' && (
              <ScoringStep
                options={namedOptions}
                criteria={criteria}
                onSetScore={setScore}
                onAutoFill={autoFill}
                onApplyQuick={applyQuick}
                onBack={() => setStep('criteria')}
                onStart={startBattle}
              />
            )}

            {step === 'battle' && tournament && (
              <ArenaBattle tournament={tournament} options={competitors} onFinish={finishBattle} />
            )}

            {step === 'result' && winner && (
              <ResultView
                question={question.trim() || '무제 고민'}
                winner={winner}
                runnerUp={runnerUp}
                criteria={criteria}
                summary={summary}
                onRematch={rematch}
                onEditScores={() => setStep('scoring')}
                onNew={newDecision}
                onShare={() => setShowShare(true)}
              />
            )}

            {step === 'history' && (
              <HistoryPanel
                records={records}
                onDelete={deleteRecord}
                onClear={clearRecords}
                onBack={() => setStep(prevInputStep)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 공유 카드 모달 */}
      <AnimatePresence>
        {showShare && winner && (
          <ShareCard
            question={question.trim() || '무제 고민'}
            winner={winner}
            criteria={criteria}
            summary={summary}
            onClose={() => setShowShare(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
