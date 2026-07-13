// 점수 계산 · 토너먼트 · 승리 이유 생성

import type { Criterion, Option, Match, Tournament, BattleResult } from './types';
import { clamp } from './utils';

/** 활성화된 기준만 반환. */
export function activeCriteria(criteria: Criterion[]): Criterion[] {
  return criteria.filter((c) => c.enabled && c.weight > 0);
}

/** 한 기준에서 선택지가 얻는 "좋음 값"(1~10). negative는 뒤집는다. */
export function goodValue(raw: number, polarity: Criterion['polarity']): number {
  const s = clamp(raw ?? 5, 1, 10);
  return polarity === 'positive' ? s : 11 - s;
}

/**
 * 선택지 총점을 100점 만점으로 정규화.
 * - positive: score * weight
 * - negative: (11 - score) * weight
 * - 정규화: 합 / (10 * 가중치합) * 100
 */
export function computeScore(option: Option, criteria: Criterion[]): number {
  const active = activeCriteria(criteria);
  if (active.length === 0) return 0;
  let total = 0;
  let maxTotal = 0;
  for (const c of active) {
    total += goodValue(option.scores[c.id], c.polarity) * c.weight;
    maxTotal += 10 * c.weight;
  }
  if (maxTotal === 0) return 0;
  return (total / maxTotal) * 100;
}

export interface CriterionContribution {
  criterion: Criterion;
  raw: number; // 사용자가 입력한 원점수 1~10
  good: number; // 방향 보정 후 값 1~10
  weighted: number; // good * weight
  share: number; // 전체 대비 비중 0~1
}

/** 기준별 기여도 분해(결과 화면 막대그래프용). */
export function breakdown(option: Option, criteria: Criterion[]): CriterionContribution[] {
  const active = activeCriteria(criteria);
  const rows = active.map((c) => {
    const raw = clamp(option.scores[c.id] ?? 5, 1, 10);
    const good = goodValue(raw, c.polarity);
    return { criterion: c, raw, good, weighted: good * c.weight, share: 0 };
  });
  const sum = rows.reduce((a, r) => a + r.weighted, 0) || 1;
  for (const r of rows) r.share = r.weighted / sum;
  return rows.sort((a, b) => b.weighted - a.weighted);
}

/** 두 선택지를 겨뤄 승자 판정. 근소차면 아주 작은 랜덤으로 가른다. */
function decide(
  left: Option,
  right: Option,
  criteria: Criterion[],
  round: number,
): Match {
  const leftScore = computeScore(left, criteria);
  const rightScore = computeScore(right, criteria);
  const diff = Math.abs(leftScore - rightScore);
  const isClose = diff < 1.5; // 100점 만점 기준 1.5점 미만이면 근소차
  let winnerId: string;
  if (diff < 0.01) {
    winnerId = Math.random() < 0.5 ? left.id : right.id; // 완전 동점 → 랜덤
  } else {
    winnerId = leftScore > rightScore ? left.id : right.id;
  }
  return {
    round,
    left,
    right,
    leftOptionId: left.id,
    rightOptionId: right.id,
    winnerId,
    leftScore,
    rightScore,
    isBye: false,
    isClose,
  };
}

/** 부전승 매치. */
function byeMatch(opt: Option, criteria: Criterion[], round: number): Match {
  const s = computeScore(opt, criteria);
  return {
    round,
    left: opt,
    right: null,
    leftOptionId: opt.id,
    rightOptionId: opt.id,
    winnerId: opt.id,
    leftScore: s,
    rightScore: 0,
    isBye: true,
    isClose: false,
  };
}

/** 싱글 엘리미네이션 토너먼트 전개. 홀수면 한 명 bye. */
export function runTournament(options: Option[], criteria: Criterion[]): Tournament {
  const rounds: Match[][] = [];
  const results: BattleResult[] = [];
  let current = options.slice();
  let round = 0;
  let runnerUpId: string | null = null;

  const byId = new Map(options.map((o) => [o.id, o]));

  while (current.length > 1) {
    const matches: Match[] = [];
    const next: Option[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = current[i + 1];
      if (!right) {
        matches.push(byeMatch(left, criteria, round));
        next.push(left);
        continue;
      }
      const m = decide(left, right, criteria, round);
      matches.push(m);
      results.push({
        round: m.round,
        leftOptionId: m.leftOptionId,
        rightOptionId: m.rightOptionId,
        winnerId: m.winnerId,
        leftScore: m.leftScore,
        rightScore: m.rightScore,
      });
      const winner = byId.get(m.winnerId)!;
      const loser = m.winnerId === left.id ? right : left;
      // 마지막 라운드(결승)의 패자가 준우승
      if (current.length === 2) runnerUpId = loser.id;
      next.push(winner);
    }
    rounds.push(matches);
    current = next;
    round++;
  }

  return {
    rounds,
    results,
    winnerId: current[0]?.id ?? options[0]?.id,
    runnerUpId,
  };
}

/** 자연스러운 한국어 이유 문장 생성. */
export function generateSummary(
  winner: Option,
  runnerUp: Option | null,
  criteria: Criterion[],
): string {
  const rows = breakdown(winner, criteria);
  if (rows.length === 0) return `${winner.name}이(가) 종합적으로 가장 앞섰어요.`;

  const active = activeCriteria(criteria);
  const posRows = rows.filter((r) => r.criterion.polarity === 'positive');
  const negRows = rows.filter((r) => r.criterion.polarity === 'negative');

  // 가장 강한 긍정 기준(원점수 높음) + 가장 안심되는 부정 기준(원점수 낮음)
  const topPos = posRows.slice().sort((a, b) => b.raw - a.raw)[0];
  const safeNeg = negRows.slice().sort((a, b) => a.raw - b.raw)[0];

  const parts: string[] = [];
  if (topPos && topPos.raw >= 6) {
    parts.push(`${topPos.criterion.name} 점수가 높`);
  }
  if (safeNeg && safeNeg.raw <= 5) {
    parts.push(`${safeNeg.criterion.name} 걱정이 적`);
  }

  // 준우승 대비 압도/근소 표현
  let margin = '';
  if (runnerUp) {
    const wScore = computeScore(winner, criteria);
    const rScore = computeScore(runnerUp, criteria);
    const gap = wScore - rScore;
    if (gap >= 12) margin = ' 압도적으로';
    else if (gap <= 2) margin = ' 근소한 차이로';
  }

  if (parts.length === 2) {
    return `${parts[0]}고 ${parts[1]}어서${margin} 오늘의 선택으로 적합해요.`;
  }
  if (parts.length === 1) {
    const tail = parts[0].endsWith('높') ? '아서' : '어서';
    return `${parts[0]}${tail}${margin} 가장 끌리는 선택이에요.`;
  }

  // 뚜렷한 강점이 없을 때: 최다 기여 기준으로 설명
  const lead = rows[0];
  const weakNeg = active.find((c) => c.polarity === 'negative' && winner.scores[c.id] >= 7);
  if (weakNeg) {
    return `${weakNeg.name}은 조금 아쉽지만 ${lead.criterion.name}에서${margin || ' 확실히'} 앞섰어요.`;
  }
  return `${lead.criterion.name}을(를) 중심으로 전체 균형이 좋아서${margin} 우승했어요.`;
}

/**
 * 빠른 모드: 사용자의 1대1 선호(승자 id 배열)를 점수로 환산.
 * 승리 횟수를 표준화해 1~10 스케일로 매핑, 전 기준에 동일 적용.
 */
export function pairwiseToScores(
  options: Option[],
  wins: Record<string, number>,
  criteria: Criterion[],
): Option[] {
  const counts = options.map((o) => wins[o.id] ?? 0);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts, 0);
  const span = Math.max(max - min, 1);
  return options.map((o) => {
    const w = wins[o.id] ?? 0;
    const norm = (w - min) / span; // 0~1
    const base = Math.round(3 + norm * 6); // 3~9
    const scores: Record<string, number> = {};
    for (const c of criteria) {
      // positive 기준엔 높게, negative 기준엔 "좋은" 방향(=낮게) 배치
      scores[c.id] = c.polarity === 'positive' ? base : clamp(11 - base, 1, 10);
    }
    return { ...o, scores };
  });
}

/** 빠른 모드 매치업(모든 쌍) 생성. */
export function buildPairs(options: Option[]): Array<[Option, Option]> {
  const pairs: Array<[Option, Option]> = [];
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) {
      pairs.push([options[i], options[j]]);
    }
  }
  return pairs;
}
