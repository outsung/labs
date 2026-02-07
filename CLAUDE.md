# Labs — Next.js Portfolio + Design Experiments

바이브 코딩으로 빠르게 아이디어를 구현하는 Next.js 기반 포트폴리오 + 디자인 실험 프로젝트.

## 기술 스택

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Deployment**: Vercel

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # 루트 레이아웃
│   ├── page.tsx                # 메인 포트폴리오 페이지
│   ├── globals.css             # Tailwind + 글로벌 스타일
│   └── labs/
│       ├── [slug]/page.tsx     # 동적 라우트 (fallback)
│       └── <lab-name>/page.tsx # 각 랩 페이지
│
├── components/                 # 메인 페이지 컴포넌트
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LabCard.tsx
│   └── Footer.tsx
│
├── lib/
│   ├── labs.ts                 # 랩 메타데이터 레지스트리
│   └── utils.ts                # cn() 유틸리티
│
└── types/
    └── lab.ts                  # Lab 타입 정의

_archive/                       # 기존 정적 HTML 프로젝트 (마이그레이션 안 함)
```

## 새 랩 추가 방법

### 수동

1. `src/app/labs/<lab-name>/page.tsx` 생성
2. `src/lib/labs.ts`에 메타데이터 등록
3. 배포: `git add . && git commit -m "Add <lab-name>" && git push`

### /replicate 스킬 사용

```
/replicate <url> [--name <lab-name>]
```

레퍼런스 URL을 분석하여 자동으로 랩 생성 (researcher → designer → builder → reviewer 워크플로우).

## 디자인 가이드

- `/frontend-design` 스킬 사용
- 세련되고 고급스러운 방향 선호
- 이모지 최소화, 타이포그래피 중심

### 디자인 원칙

- **다크 테마 우선**: 배경 `#0a0a0a` ~ `#1a1a1a`, 밝은 텍스트
- **타이포그래피 중심**: 폰트 크기, weight, letter-spacing으로 위계 표현
- **미니멀**: 불필요한 장식 배제, 여백으로 구조 표현
- **Tailwind CSS**: 유틸리티 클래스 기반 스타일링
- **Framer Motion**: 자연스러운 진입/전환 애니메이션

### 메인 페이지

테마 시스템 없음. `src/app/page.tsx`와 `src/components/`를 직접 수정하는 방식.

### 랩 페이지

각 랩은 `src/app/labs/<name>/page.tsx`에서 완전히 독립적인 디자인 가능. 랩 간 스타일 간섭 없음.

## 에이전트 워크플로우

`.claude/agents/`에 4개 에이전트를 정의하여 팀 기반 병렬 작업을 지원한다.

### 에이전트 구성

| 에이전트 | 역할 | 쓰기 권한 |
|---------|------|----------|
| `researcher` | 디자인 트렌드, 레퍼런스, 컬러/타이포 조사 | X |
| `designer` | React 컴포넌트 구조, Tailwind 디자인 시스템, 명세 | X |
| `builder` | 실제 React/TypeScript/Tailwind 코드 구현 | O |
| `reviewer` | 품질, 접근성, 반응형, 일관성 검수 | X |

### 워크플로우

```
researcher → designer → builder → reviewer
(조사)       (설계)      (구현)     (검수)
```

1. **researcher**: 트렌드 조사, 레퍼런스 수집, 리소스 탐색
2. **designer**: 조사 결과를 바탕으로 Tailwind 디자인 토큰, 컴포넌트 명세, 레이아웃 설계
3. **builder**: 명세를 바탕으로 실제 React/TypeScript/Tailwind 코드 구현
4. **reviewer**: 구현 결과를 품질/접근성/반응형/일관성 관점에서 검수

팀 생성 예시:
```
TeamCreate → TaskCreate (조사/설계/구현/검수) → Task (에이전트 스폰)
```

## 프로젝트 목록

| 프로젝트 | 설명 | 상태 |
|---------|------|------|
| typography-001 | 타이포그래피 실험 | active |
| jerry-plants | 제리의 프리미엄 식물샵 | archived |
| commune | 프라이빗 공간대여 & 모임 서비스 | archived |
| wayfare | 여행 일정 컨설팅 서비스 | archived |
| k-trading-ai | DBS LABS - AI 기반 자동매매 솔루션 | archived |
| atelier | 크리에이티브 스튜디오 포트폴리오 | archived |
| trading-indicators | 기술적 분석 지표 시각화 | archived |
