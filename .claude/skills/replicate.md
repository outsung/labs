---
description: "Replicate a web design reference into a new lab page. Analyzes the URL, designs components, builds the implementation, and reviews quality."
user-invocable: true
---

# /replicate

레퍼런스 URL을 분석하여 새로운 랩 페이지를 자동 생성합니다.

## 사용법

```
/replicate <url> [--name <lab-name>]
```

- `<url>`: 분석할 레퍼런스 웹사이트 URL (필수)
- `--name <lab-name>`: 랩 이름 (선택, 없으면 URL에서 추출)

## 워크플로우

에이전트 팀을 생성하여 4단계 파이프라인을 실행합니다:

### 1. Research (researcher 에이전트)
- URL 접속 및 디자인 분석
- 컬러 팔레트, 타이포그래피, 레이아웃 패턴 추출
- 핵심 애니메이션/인터랙션 식별
- 사용된 폰트, 라이브러리 파악

### 2. Design (designer 에이전트)
- 리서치 결과를 바탕으로 컴포넌트 명세 작성
- Tailwind CSS 클래스 매핑
- Framer Motion 애니메이션 명세
- 반응형 전략 수립

### 3. Build (builder 에이전트)
- `src/app/labs/<lab-name>/page.tsx` 생성
- `src/lib/labs.ts`에 메타데이터 등록
- 명세에 따른 React/TypeScript/Tailwind 구현

### 4. Review (reviewer 에이전트)
- 레퍼런스와의 유사도 확인
- 품질/접근성/반응형 검수
- 개선 사항 피드백

## 실행

아래 순서로 팀을 구성하고 태스크를 생성하세요:

1. `TeamCreate`로 팀 생성
2. `TaskCreate`로 4개 태스크 생성 (research → design → build → review, 순차 의존성)
3. `Task`로 각 에이전트 스폰 (`.claude/agents/` 에이전트 타입 사용)
4. 파이프라인 완료 후 결과 보고

## 주의사항

- 레퍼런스를 100% 복제하는 것이 아닌, 핵심 디자인 패턴을 추출하여 재해석
- 다크 테마 기반으로 재구성
- 저작권 있는 이미지/콘텐츠는 사용하지 않음
- 모든 텍스트는 placeholder로 대체
