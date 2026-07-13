// localStorage 래퍼. 접근 실패 시에도 앱이 계속 동작하도록 안전하게 감싼다.

import type { DecisionRecord } from './types';

const KEY = 'decision-arena:records';
const MAX_RECORDS = 10;

/** localStorage 사용 가능 여부(사파리 프라이빗 등에서 예외 발생 대비). */
function available(): boolean {
  try {
    const t = '__da_test__';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

/** 최근 기록 로드. 실패하면 빈 배열. */
export function loadRecords(): DecisionRecord[] {
  if (!available()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DecisionRecord[];
  } catch {
    return [];
  }
}

/** 기록 저장(최신순, 최대 10개). 실패해도 조용히 무시. */
export function saveRecords(records: DecisionRecord[]): void {
  if (!available()) return;
  try {
    const trimmed = records.slice(0, MAX_RECORDS);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    /* 저장 실패는 무시 — 앱 흐름을 막지 않는다 */
  }
}

/** 새 기록을 맨 앞에 추가한 배열을 반환. */
export function prependRecord(records: DecisionRecord[], rec: DecisionRecord): DecisionRecord[] {
  return [rec, ...records].slice(0, MAX_RECORDS);
}
