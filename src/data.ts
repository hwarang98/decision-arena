// 기본 예시 데이터 & 시드 팩토리

import type { Criterion, Option } from './types';
import { uid, pickColor } from './utils';

/** 기본 판단 기준 5종. */
export function defaultCriteria(): Criterion[] {
  return [
    { id: 'c_appeal', name: '끌림', weight: 8, enabled: true, polarity: 'positive' },
    { id: 'c_cost', name: '비용', weight: 5, enabled: true, polarity: 'negative' },
    { id: 'c_effort', name: '귀찮음', weight: 6, enabled: true, polarity: 'negative' },
    { id: 'c_satisfy', name: '만족도', weight: 9, enabled: true, polarity: 'positive' },
    { id: 'c_regret', name: '후회 가능성', weight: 4, enabled: true, polarity: 'negative' },
  ];
}

/** 새 선택지 하나를 만든다. 모든 기준 점수는 기본 5점. */
export function makeOption(name: string, index: number, criteria: Criterion[]): Option {
  const scores: Record<string, number> = {};
  for (const c of criteria) scores[c.id] = 5;
  return { id: uid('o_'), name: name.trim(), scores, color: pickColor(index) };
}

/** 시드 질문. */
export const SEED_QUESTION = '오늘 뭐 먹지?';

/** 시드 선택지 이름. */
export const SEED_OPTION_NAMES = ['마라탕', '햄버거', '초밥', '김치찌개'];

/** 시드 선택지 생성. */
export function seedOptions(criteria: Criterion[]): Option[] {
  return SEED_OPTION_NAMES.map((n, i) => makeOption(n, i, criteria));
}

/** 새 고민 시작 시 쓰는 빈 선택지 2개(카드 최소 개수). */
export function blankOptions(criteria: Criterion[]): Option[] {
  return [makeOption('', 0, criteria), makeOption('', 1, criteria)];
}

/** 사용자가 기준 추가 시 쓰는 프리셋 이름 후보. */
export const EXTRA_CRITERIA_PRESETS = ['건강', '분위기', '재미', '새로움', '접근성'];
