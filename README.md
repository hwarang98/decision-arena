# ⚔️ Decision Arena

선택지를 경기장에 입장시켜 **토너먼트처럼 겨루게** 하고, 사용자가 정한 기준·중요도·점수를 반영해 “가장 그럴듯한 선택”을 뽑아주는 의사결정 웹앱입니다. 단순 랜덤 추첨기가 아니라, 기준별 가중치 계산으로 승자를 결정합니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
```

Node 18+ 권장. 백엔드/API 없이 전부 프론트엔드에서 동작하며, 최근 기록은 `localStorage`에 저장됩니다.

## 화면 흐름

`setup` → `criteria` → `scoring` → `battle` → `result` (+ 언제든 `history`)

1. **고민 입력** — 질문과 선택지(최소 2개)를 카드로 입력. hover 시 tilt/glare, 추가 시 pop 애니메이션.
2. **기준 설정** — 끌림·비용·귀찮음·만족도·후회 가능성 기본 5종. 켜기/끄기, 중요도 슬라이더(count-up), 방향(높을수록/낮을수록 좋음) 전환, 기준 추가/이름 수정.
3. **점수 입력** — 카드 안 슬라이더로 직접 입력, “대충 자동 채우기”, 또는 **빠른 모드**(1대1 선호를 고르면 점수 자동 환산).
4. **아레나 배틀** — 대진표 레일이 채워지고, VS 충돌·스포트라이트·스코어 카운트업으로 1대1 경기를 진행. 홀수는 부전승(bye).
5. **결과** — 우승 선택지, 자동 생성된 승리 이유, 기준별 기여도, 2위와의 차이. 다시 겨루기 / 점수 수정 / 새 고민 / 공유 카드.
6. **공유 카드** — 결과를 이미지 카드로 렌더링해 PNG 저장(`html-to-image`) 및 Web Share.

## 점수 계산 규칙

- 활성화된 기준만 사용.
- `positive` 기준: `score × weight`
- `negative` 기준: `(11 − score) × weight`
- 총점을 `합 / (10 × 가중치합) × 100` 으로 **100점 만점 정규화**.
- 완전 동점이면 아주 작은 랜덤으로 가르고, 근소차는 UI에 “근소한 차이”로 표시.

## 구조

```
src/
├─ types.ts          도메인 타입 (Option, Criterion, Match, Tournament, DecisionRecord)
├─ data.ts           기본 기준 · 시드 예시 데이터 · 팩토리
├─ scoring.ts        점수 정규화 · 토너먼트 전개 · 이유 생성 · 빠른모드 환산
├─ storage.ts        localStorage 안전 래퍼 (실패해도 앱 계속 동작)
├─ utils.ts          순수 유틸 (id, clamp, shuffle, 색상, 날짜)
├─ App.tsx           상태 오케스트레이션 · 단계 전환 · 헤더
└─ components/
   ├─ ui.tsx             Magnetic · TiltCard · CountUp · SplitTitle · ArenaBackground · Confetti · Button · Panel
   ├─ OptionCard.tsx     선택지 입력 카드
   ├─ CriterionControl.tsx  기준 컨트롤
   ├─ SetupStep.tsx / CriteriaStep.tsx / ScoringStep.tsx
   ├─ ArenaBattle.tsx    대진표 + VS 충돌 연출 (시그니처)
   ├─ ResultView.tsx     결과 · 기여도 · 차이
   ├─ HistoryPanel.tsx   최근 결정 기록
   └─ ShareCard.tsx      공유용 이미지 카드
```

## 기술 스택

Vite · React 18 · TypeScript(strict) · Tailwind CSS · Framer Motion · lucide-react · html-to-image

## 접근성 / 반응형

- 모든 아이콘 버튼에 `aria-label`, 토글은 `role="switch"` + `aria-checked`.
- 키보드 포커스 링(`:focus-visible`), `prefers-reduced-motion` 존중.
- 상태를 색상만으로 구분하지 않고 라벨/방향 아이콘 병기.
- 모바일~데스크톱 반응형. 한글은 `break-keep`으로 카드/버튼 밖으로 넘치지 않게 처리.
