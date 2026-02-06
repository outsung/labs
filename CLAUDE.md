# Labs Repository

바이브 코딩으로 빠르게 아이디어를 구현하는 프로젝트 모음.

## GitHub Pages

- **Repo**: https://github.com/outsung/labs
- **Site**: https://outsung.github.io/labs/

## 구조

```
labs/
├── jerry-plants/     → outsung.github.io/labs/jerry-plants/
├── project-2/        → outsung.github.io/labs/project-2/
└── ...
```

## 새 프로젝트 추가 방법

1. 폴더 생성: `mkdir project-name`
2. `index.html` 작성
3. 배포:
```bash
git add . && git commit -m "Add project-name" && git push
```

## 프로젝트 목록

| 프로젝트 | 설명 | URL |
|---------|------|-----|
| jerry-plants | 제리의 프리미엄 식물샵 | [링크](https://outsung.github.io/labs/jerry-plants/) |
| commune | 프라이빗 공간대여 & 모임 서비스 | [링크](https://outsung.github.io/labs/commune/) |
| wayfare | 여행 일정 컨설팅 서비스 (full-page scroll-snap 디자인) | [링크](https://outsung.github.io/labs/wayfare/) |
| k-trading-ai | DBS LABS - AI 기반 자동매매 솔루션 | [링크](https://outsung.github.io/labs/k-trading-ai/) |

## 에이전트 워크플로우

`.claude/agents/`에 4개 에이전트를 정의하여 팀 기반 병렬 작업을 지원한다.

### 에이전트 구성

| 에이전트 | 역할 | 쓰기 권한 |
|---------|------|----------|
| `researcher` | 디자인 트렌드, 레퍼런스, 컬러/타이포 조사 | X |
| `designer` | HTML 구조, CSS 디자인 시스템, 컴포넌트 명세 | X |
| `builder` | 실제 HTML/CSS/JS 코드 구현 | O |
| `reviewer` | 품질, 접근성, 반응형, 일관성 검수 | X |

### 워크플로우

```
researcher → designer → builder → reviewer
(조사)       (설계)      (구현)     (검수)
```

1. **researcher**: 트렌드 조사, 레퍼런스 수집, 리소스 탐색
2. **designer**: 조사 결과를 바탕으로 디자인 토큰, 컴포넌트 명세, 레이아웃 설계
3. **builder**: 명세를 바탕으로 실제 HTML/CSS/JS 코드 구현
4. **reviewer**: 구현 결과를 품질/접근성/반응형/일관성 관점에서 검수

팀 생성 예시:
```
TeamCreate → TaskCreate (조사/설계/구현/검수) → Task (에이전트 스폰)
```

## 디자인 가이드

- `/frontend-design` 스킬 사용
- 세련되고 고급스러운 방향 선호
- 이모지 최소화, 타이포그래피 중심

### 디자인 원칙

- **다크 테마 우선**: 배경 `#0a0a0a` ~ `#1a1a1a`, 밝은 텍스트
- **타이포그래피 중심**: 폰트 크기, weight, letter-spacing으로 위계 표현
- **미니멀**: 불필요한 장식 배제, 여백으로 구조 표현
- **CSS Custom Properties**: 모든 디자인 토큰을 변수로 관리
- **CDN Only**: 빌드 도구 없이 CDN 링크로만 외부 리소스 사용
- **단일 HTML**: 각 프로젝트는 `index.html` 기반, 인라인 CSS/JS 가능
