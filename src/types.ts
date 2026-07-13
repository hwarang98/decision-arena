// 앱 전역에서 쓰는 도메인 타입 정의

export type Polarity = 'positive' | 'negative';

/** 판단 기준. 높을수록 좋은지(positive) 낮을수록 좋은지(negative)를 polarity로 구분한다. */
export interface Criterion {
  id: string;
  name: string;
  weight: number; // 중요도 0~10
  enabled: boolean;
  polarity: Polarity;
}

/** 선택지. scores는 기준 id별 1~10 점수. */
export interface Option {
  id: string;
  name: string;
  scores: Record<string, number>;
  color: string; // 카드 포인트 컬러(hex)
}

/** 배틀 단위 결과 기록 (요구 데이터 구조). */
export interface BattleResult {
  round: number;
  leftOptionId: string;
  rightOptionId: string;
  winnerId: string;
  leftScore: number;
  rightScore: number;
}

/** 토너먼트 한 경기(bye 포함). 화면 연출용으로 Option 객체를 함께 담는다. */
export interface Match extends BattleResult {
  left: Option;
  right: Option | null; // null이면 부전승(bye)
  isBye: boolean;
  isClose: boolean; // 근소한 차이 여부
}

/** 토너먼트 전체 결과. */
export interface Tournament {
  rounds: Match[][];
  results: BattleResult[];
  winnerId: string;
  runnerUpId: string | null;
}

/** 최근 결정 기록 (localStorage 저장 단위). */
export interface DecisionRecord {
  id: string;
  question: string;
  winnerName: string;
  winnerColor: string;
  winnerScore: number;
  runnerUpName: string | null;
  createdAt: number;
  summary: string;
}

/** 화면 단계. */
export type Step = 'setup' | 'criteria' | 'scoring' | 'battle' | 'result' | 'history';
