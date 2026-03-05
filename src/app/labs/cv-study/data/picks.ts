export interface Pick {
  id: string;
  title: string;
  group: "cvpr" | "iccv" | "eccv" | "other";
  venue: string;
  year: number;
  paperUrl: string;
  codeUrl?: string;
  tagKo: string;
  oneLineKo: string;
  summaryKo: string; // markdown
}

export const picks: Pick[] = [
  // ─── CVPR ──────────────────────────────────────────
  {
    id: "dust3r",
    title: "DUSt3R: Geometric 3D Vision Made Easy",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.14132",
    codeUrl: "https://github.com/naver/dust3r",
    tagKo: "3D 재구성",
    oneLineKo:
      "사진 2장만으로 3D 포인트 클라우드를 생성. 카메라 위치 추정도 자동.",
    summaryKo: `## DUSt3R: Geometric 3D Vision Made Easy

### 아키텍처
DUSt3R은 **CroCo(Cross-view Completion) 사전학습 ViT**를 백본으로 사용하는 인코더-디코더 구조입니다.

- **인코더**: ViT-Large (패치 크기 16, 임베딩 차원 1024, 24 레이어). 두 이미지를 각각 독립적으로 인코딩
- **디코더**: 2개의 ViT 디코더가 크로스 어텐션으로 연결. 디코더 1은 이미지1 기준 좌표계에서 이미지1의 포인트맵 예측, 디코더 2는 같은 좌표계에서 이미지2의 포인트맵 예측
- **출력 헤드**: 각 패치마다 3D 좌표 (x,y,z)와 confidence 값을 회귀. 해상도 224x224 기준 각 이미지당 14x14=196개의 3D 포인트 예측

### 핵심 알고리즘
1. **Pointmap Regression**: 이미지 쌍 (I1, I2) 입력 → 디코더가 X1 ∈ R^(HxWx3), X2 ∈ R^(HxWx3) 출력. 두 포인트맵 모두 이미지1의 카메라 좌표계에서 표현됨
2. **Confidence-aware Loss**: 각 포인트에 confidence c를 예측하고, regression loss에 가중치로 사용
3. **Global Alignment**: N장의 이미지가 있으면 모든 가능한 쌍을 처리한 후, 각 쌍의 포인트맵을 하나의 글로벌 좌표계로 정렬. Procrustes alignment + gradient-based optimization 사용

### 손실 함수
\`\`\`
L = Σ_i confidence_i * ||predicted_3d_i - gt_3d_i||_1 - α * log(confidence_i)
\`\`\`
- 3D 좌표의 L1 regression loss에 confidence 기반 가중치 적용
- confidence가 높은 포인트에 더 큰 가중치, 동시에 -log(c) 항으로 confidence가 너무 낮아지는 것 방지

### 학습 데이터 및 설정
- **학습 데이터**: Habitat(실내 합성), ScanNet++(실내), BlendedMVS, MegaDepth, ARKitScenes, CO3D, StaticThings3D 등 혼합
- **학습**: AdamW optimizer, lr=3e-4, cosine schedule, 배치 64, 224x224 해상도, A100 GPU 8장에서 약 1주일
- **CroCo 사전학습**: 자기지도 학습으로 한 이미지에서 다른 이미지의 마스킹된 패치를 복원하는 태스크로 3D 기하학적 이해를 학습

### 정량적 결과
- **ScanNet 카메라 포즈 추정**: AUC@5°에서 COLMAP+SuperGlue(72.3) 대비 DUSt3R(73.9)로 SfM 없이도 우수
- **7-Scenes 재위치화**: 중간 회전 오차 1.2°, 위치 오차 2.1cm (기존 최고 수준)
- **DTU 3D 재구성**: Chamfer distance 1.24mm (정밀도/완전성 모두 경쟁력 있음)
- 추론 속도: 이미지 쌍당 ~0.1초 (V100 GPU)`,
  },
  {
    id: "depth-anything",
    title: "Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2401.10891",
    codeUrl: "https://github.com/LiheYoung/Depth-Anything",
    tagKo: "깊이 추정",
    oneLineKo: "아무 사진 1장 → 깊이맵 추출. 스마트폰 사진으로 바로 사용 가능.",
    summaryKo: `## Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data

### 아키텍처
DINOv2 ViT를 인코더로, DPT(Dense Prediction Transformer) 디코더를 사용하는 구조입니다.

- **인코더**: DINOv2 ViT-S/B/L (각각 22M/86M/304M 파라미터). 사전학습된 자기지도 ViT의 강력한 시각 표현 활용
- **디코더**: DPT 헤드 — ViT의 4개 중간 레이어 특징을 추출, Reassemble 모듈로 멀티스케일 특징맵 생성, Fusion 모듈(ResidualConv + 업샘플링)로 점진적 해상도 복원
- **출력**: 입력 해상도와 동일한 단일 채널 상대적 깊이맵 (affine-invariant)

### 학습 파이프라인
1. **Teacher 학습**: 라벨 데이터 ~1.5M장 (Hypersim, Virtual KITTI, NYUv2, KITTI, DIODE, ETH3D 등 6개 데이터셋 혼합)으로 DINOv2-L 기반 teacher 모델 학습
2. **Pseudo-label 생성**: 6,200만 장의 비라벨 이미지 (SA-1B, OpenImages, BDD100K 등)에 teacher로 깊이 추론
3. **Student 학습**: pseudo-label + 원본 라벨 데이터를 합쳐 student 모델 학습. 핵심: 비라벨 이미지에 **강한 augmentation** (CutMix, 컬러 왜곡, Gaussian blur 등) 적용하여 teacher보다 더 강건한 모델 유도

### 손실 함수
\`\`\`
L_total = L_labeled + λ * L_unlabeled

L_labeled = affine-invariant mean absolute error
  d* = (d - median(d)) / MAD(d)  # 스케일/시프트 정규화
  L = |d*_pred - d*_gt|

L_unlabeled = |d_student - sg(d_teacher)|  # sg = stop gradient
\`\`\`
- 라벨 데이터: scale-shift invariant loss (MiDaS 방식)
- 비라벨 데이터: teacher 출력과의 L1 loss. teacher는 augmentation 없는 원본 이미지 사용

### Depth Anything V2 주요 변경점
- teacher를 DINOv2-G(1.1B 파라미터)로 업그레이드
- 비라벨 데이터 대신 **합성 데이터(Hypersim, Virtual KITTI, TartanAir 등)만으로** teacher 학습 → pseudo label 품질 대폭 향상
- Metric depth 지원: NYUv2(실내) 또는 KITTI(실외) fine-tuning으로 절대 깊이(미터) 출력 가능

### 정량적 결과
- **NYUv2 제로샷**: AbsRel 0.056 (MiDaS 3.1: 0.075, ZoeDepth: 0.075)
- **KITTI 제로샷**: AbsRel 0.080 (MiDaS 3.1: 0.109)
- **V2 NYUv2 fine-tune**: δ1 accuracy 0.988, AbsRel 0.043
- 모델 크기별: ViT-S (24.8M) → 모바일 배포 가능, ViT-L (335.3M) → 최고 품질`,
  },
  {
    id: "splatam",
    title: "SplaTAM: Splat Track & Map 3D Gaussians for Dense RGB-D SLAM",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.02126",
    codeUrl: "https://github.com/spla-tam/SplaTAM",
    tagKo: "SLAM + 3DGS",
    oneLineKo:
      "카메라를 들고 걸으면서 실시간으로 3D Gaussian Splatting 맵 생성.",
    summaryKo: `## SplaTAM: Splat Track & Map 3D Gaussians for Dense RGB-D SLAM

### 아키텍처
3D Gaussian Splatting을 장면 표현으로 사용하는 dense SLAM 시스템. 3단계 반복 파이프라인으로 구성됩니다.

- **장면 표현**: 3D 가우시안 집합 G = {(μ_i, Σ_i, c_i, α_i)} — 위치, 공분산, 색상(SH), 불투명도
- **렌더러**: 3DGS의 미분 가능 래스터라이저를 그대로 사용. 컬러 이미지 + 깊이 이미지 + 실루엣(가시성) 맵을 동시 렌더링

### 3단계 파이프라인
**1. Tracking (카메라 포즈 최적화)**
\`\`\`
입력: 현재 프레임 (I_t, D_t), 기존 가우시안 맵
과정:
  - 이전 포즈를 초기값으로 설정
  - 현재 가우시안 맵을 해당 포즈에서 렌더링 → (I_render, D_render, S_render)
  - L_track = λ_1 * L1(I_t, I_render) + (1-λ_1) * L_SSIM + λ_2 * L1(D_t, D_render)
  - 실루엣 맵 S로 마스킹: 기존 맵에 존재하는 영역만 loss 계산
  - 카메라 SE(3) 파라미터만 역전파로 최적화 (40 iterations)
\`\`\`

**2. Densification (새 가우시안 추가)**
\`\`\`
과정:
  - 실루엣 맵에서 S < 0.5인 픽셀 = 기존 맵에 없는 새 영역
  - 해당 픽셀의 깊이 D_t를 사용해 3D 위치 계산: μ = K^(-1) * [u,v,1] * D_t(u,v)
  - 새 가우시안 초기화: 위치=μ, 색상=I_t(u,v), 반지름=깊이에 비례, 불투명도=0.5
  - 기존 가우시안 집합에 추가
\`\`\`

**3. Mapping (가우시안 파라미터 최적화)**
\`\`\`
과정:
  - 최근 N개 키프레임 + 현재 프레임 선택
  - 각 프레임에서 렌더링하여 GT와 비교
  - L_map = λ_1 * L1(I, I_render) + (1-λ_1) * L_SSIM + λ_2 * L1(D, D_render)
  - 가우시안 파라미터 (μ, Σ, c, α) 전부 최적화 (60 iterations)
  - 카메라 포즈는 고정
\`\`\`

### 키프레임 전략
- 매 5프레임마다 키프레임 추가 또는 카메라 이동량이 임계값 초과 시 추가
- Mapping 시 최근 키프레임에서 무작위 샘플링하여 학습

### 정량적 결과
- **Replica 데이터셋**: PSNR 34.11 (NICE-SLAM: 22.12, iMAP: 22.30), ATE RMSE 0.36cm (NICE-SLAM: 0.97cm)
- **TUM-RGBD**: ATE RMSE 1.16cm
- **ScanNet**: ATE RMSE 7.24cm
- 렌더링 속도: 200+ FPS (NeRF SLAM 대비 ~300배 빠름)
- 메모리: Replica 기준 가우시안 ~200K개, ~50MB`,
  },
  {
    id: "gs-slam",
    title: "GS-SLAM: Dense Visual SLAM with 3D Gaussian Splatting",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2311.11700",
    tagKo: "SLAM + 3DGS",
    oneLineKo:
      "3D Gaussian Splatting을 SLAM에 적용. 실시간 고품질 3D 맵 생성.",
    summaryKo: `## GS-SLAM: Dense Visual SLAM with 3D Gaussian Splatting

### 아키텍처
SplaTAM과 동일하게 3DGS 기반 SLAM이지만, **적응적 가우시안 관리**와 **키프레임 선택 전략**에서 차별화됩니다.

### Adaptive Gaussian Expansion Strategy
SplaTAM은 실루엣 기반으로 새 가우시안을 추가하는 반면, GS-SLAM은 더 정교한 전략을 사용합니다:
\`\`\`
1. 렌더링된 깊이 D_render와 관측 깊이 D_obs 비교
2. |D_render - D_obs| > τ_depth 인 영역 = 기하학적으로 부정확한 영역
3. 해당 영역에서:
   a) 기존 가우시안 분할 (split) — 큰 가우시안을 2개로 나눔
   b) 새 가우시안 추가 (clone) — 관측된 깊이 기반 초기화
4. 불투명도 α < τ_prune 인 가우시안 제거 (pruning)
\`\`\`

### Tracking
- SplaTAM과 유사하게 렌더링 기반 포즈 최적화
- 차이점: **coarse-to-fine 전략** — 먼저 저해상도에서 대략적 포즈 추정 후 원본 해상도에서 정제
- Loss: L1 photometric + L1 depth + 실루엣 가중치

### Mapping
- 키프레임 윈도우 기반 최적화 (최근 W개 + 전역 랜덤 K개)
- **Overlap-aware 키프레임 선택**: 현재 뷰와의 가시성 겹침 비율 기반으로 키프레임 선택
- 가우시안 파라미터 + 선택된 키프레임의 포즈를 공동 최적화 (joint optimization)

### SplaTAM과의 비교
| 항목 | SplaTAM | GS-SLAM |
|------|---------|---------|
| 가우시안 추가 | 실루엣 마스크 기반 | 깊이 오차 기반 적응적 |
| 프루닝 | 없음 | 불투명도 기반 주기적 |
| 포즈 최적화 | 단일 스케일 | Coarse-to-fine |
| Mapping 시 포즈 | 고정 | 공동 최적화 |

### 정량적 결과
- **Replica**: PSNR 32.43, ATE RMSE 0.48cm
- **TUM-RGBD**: ATE RMSE 1.32cm
- 가우시안 수: SplaTAM 대비 ~30% 적음 (동일 품질 기준)
- 메모리: 대규모 장면에서 SplaTAM보다 안정적 (적응적 pruning 덕분)`,
  },
  {
    id: "metric3d",
    title: "Metric3D v2: A Versatile Monocular Geometric Foundation Model",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2404.15506",
    codeUrl: "https://github.com/YvanYin/Metric3D",
    tagKo: "깊이 추정",
    oneLineKo:
      "사진 1장에서 실제 미터 단위의 깊이와 표면 법선을 추정하는 모델.",
    summaryKo: `## Metric3D v2: A Versatile Monocular Geometric Foundation Model

### 핵심 문제: 카메라 Intrinsic Ambiguity
단안 깊이 추정의 근본적 문제 — 동일 장면이라도 **초점 거리(focal length)**가 다르면 깊이 스케일이 달라짐. 예: f=50mm로 찍은 벽과 f=24mm로 찍은 벽은 깊이 분포가 완전히 다름. 기존 모델들은 이를 무시하고 상대적 깊이만 학습.

### Canonical Camera Transform (CCT)
Metric3D의 핵심 기법. 모든 학습/추론 이미지를 **표준 카메라(canonical camera)**로 변환합니다:
\`\`\`
1. 입력 이미지의 카메라 intrinsic K = [[f_x, 0, c_x], [0, f_y, c_y], [0, 0, 1]]
2. 표준 초점 거리 f_canonical 설정 (학습 데이터의 중간값)
3. 스케일 비율: s = f_canonical / f_x
4. 이미지 리사이즈: I_canonical = resize(I, scale=s)
5. 깊이 예측 후 역변환: D_original = D_canonical * (f_x / f_canonical)
\`\`\`
이 변환으로 **다양한 카메라의 이미지를 하나의 통일된 스케일**에서 학습 가능.

### 아키텍처 (v2)
- **인코더**: ViT-giant (DINOv2 사전학습, 1.1B 파라미터)
- **디코더**: DPT 헤드의 변형. 깊이와 법선을 동시에 예측하는 dual-head 구조
  - Depth head: 1채널 metric depth (미터 단위)
  - Normal head: 3채널 surface normal (단위 벡터)
- **Depth-Normal Consistency Module**: 예측된 깊이에서 수치적으로 법선을 계산하고, 예측된 법선과 일치하도록 mutual supervision

### 손실 함수
\`\`\`
L = L_depth + λ_n * L_normal + λ_c * L_consistency

L_depth = Si-Log loss = α*√(Σ(log d_pred - log d_gt)² - λ*(Σ(log d_pred - log d_gt))²/n)
L_normal = 1 - cos_sim(n_pred, n_gt) + ||1 - |n_pred|||  # 코사인 유사도 + 단위 벡터 제약
L_consistency = ||n_from_depth - n_pred||  # 깊이에서 유도한 법선 vs 직접 예측 법선
\`\`\`

### 학습 데이터
16개 데이터셋 혼합: NYUv2, KITTI, Hypersim, ScanNet, DIODE, Waymo, Argoverse, Taskonomy 등. 총 ~16M 이미지. 각 데이터셋의 카메라 intrinsic이 다르지만 CCT로 통일.

### 정량적 결과
- **NYUv2**: AbsRel 0.047, δ1 0.989 (당시 SOTA)
- **KITTI**: AbsRel 0.052, δ1 0.985
- **ScanNet (zero-shot)**: AbsRel 0.083
- **Surface Normal (NYUv2)**: Mean angular error 14.9° → v2에서 11.2°로 개선
- 추론: 이미지 1장당 ~0.05초 (A100)`,
  },
  {
    id: "photo-slam",
    title: "Photo-SLAM: Real-time Simultaneous Localization and Photorealistic Mapping",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2311.16728",
    codeUrl: "https://github.com/HuajianUP/Photo-SLAM",
    tagKo: "SLAM + 3DGS",
    oneLineKo:
      "ORB 특징 추적 + 3DGS 매핑을 결합한 하이브리드 SLAM. 실시간 포토리얼리스틱.",
    summaryKo: `## Photo-SLAM: Real-time Simultaneous Localization and Photorealistic Mapping

### SplaTAM vs Photo-SLAM: 설계 철학 차이
\`\`\`
SplaTAM: 3DGS로 tracking + mapping 모두 수행 (end-to-end differentiable)
  장점: 통합 파이프라인
  단점: tracking이 렌더링 품질에 의존 → 초기 맵이 나쁘면 추적도 불안정

Photo-SLAM: ORB 특징으로 tracking (검증된 전통 방법) + 3DGS로 mapping만
  장점: 추적이 안정적 (ORB-SLAM3 수준), 매핑은 포토리얼리스틱
  단점: 두 시스템 간 인터페이스 필요
\`\`\`

### 아키텍처
\`\`\`
[Tracking Thread] — ORB-SLAM3 기반
  입력: RGB(-D) 프레임
  ORB 특징 추출 → 매칭 → PnP/Essential Matrix → 카메라 포즈
  키프레임 선택, 로컬 BA, 루프 클로저 모두 ORB-SLAM3에서 처리
  → 안정적인 SE(3) 포즈 출력

[Mapping Thread] — 3DGS + Hyper Primitives
  키프레임 도착 시:
  1. ORB 포인트를 3D 가우시안으로 초기화
  2. Gaussian Pyramids: 멀티스케일 가우시안 (coarse→fine)
  3. Hyper Primitives: 각 가우시안에 작은 MLP를 부착
     → appearance embedding으로 조명 변화 보정

[Rendering Thread]
  미분 가능 래스터라이저로 실시간 렌더링
  학습 뷰 + novel 뷰 모두 실시간
\`\`\`

### Hyper Primitives (핵심 기법)
\`\`\`
기본 3DGS: 각 가우시안의 색상 = SH 계수 (고정된 view-dependent color)
문제: 실내 촬영 시 자동 노출/화이트밸런스 변화 → 같은 점이 이미지마다 다른 색상

Hyper Primitive:
  각 가우시안 i에 부착된 소형 MLP:
    입력: SH 특징 f_i + appearance embedding a_k (이미지 k별 학습)
    출력: 보정된 색상 c_i,k

  a_k ∈ R^32: 이미지별 조명/노출 조건을 인코딩하는 학습 가능 벡터
  MLP: 2레이어, 히든 32 (매우 경량)

  → 같은 가우시안이 이미지마다 다른 색상으로 렌더링 가능
  → 조명 변화에 강건
\`\`\`

### Gaussian Pyramid (멀티스케일)
\`\`\`
Level 0: 원본 해상도 가우시안 (디테일)
Level 1: 2x downscale 가우시안 (중간)
Level 2: 4x downscale 가우시안 (coarse)

학습: 각 레벨에서 해당 해상도의 이미지와 비교
→ coarse 구조부터 안정적으로 학습, fine 디테일은 점진적 추가
→ NeRF의 coarse-to-fine과 유사한 효과를 3DGS에서 달성
\`\`\`

### 손실 함수
\`\`\`
L = Σ_levels (λ_l * ((1-λ)*L1(I_l, I_gt_l) + λ*L_SSIM(I_l, I_gt_l)))
\`\`\`

### 정량적 결과
- **Replica**: ATE RMSE 0.36cm (ORB-SLAM3 수준), PSNR 32.8, FPS 200+
- **TUM-RGBD**: ATE RMSE 0.89cm (SplaTAM: 1.16cm)
- **ScanNet**: ATE RMSE 5.2cm
- 렌더링: PSNR에서 SplaTAM과 비슷, 추적 안정성은 ORB-SLAM3 수준
- 루프 클로저 지원 (SplaTAM은 미지원) → 대규모 장면에서 유리`,
  },
  {
    id: "monogs",
    title: "Gaussian Splatting SLAM",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.06741",
    codeUrl: "https://github.com/muskie82/MonoGS",
    tagKo: "SLAM (RGB-only)",
    oneLineKo:
      "RGB 카메라만으로 3DGS SLAM 수행. 깊이 센서 없이 스마트폰으로 3D 스캔.",
    summaryKo: `## Gaussian Splatting SLAM (MonoGS)

### SplaTAM과의 핵심 차이
\`\`\`
SplaTAM: RGB-D 필수 (깊이 센서 필요)
MonoGS: RGB-only 동작 (일반 카메라/스마트폰)

SplaTAM: 실루엣 기반 densification
MonoGS: 기하학적 정규화 + 공동 최적화로 안정적 RGB-only 학습
\`\`\`

### 아키텍처
\`\`\`
[장면 표현]: 3D 가우시안 집합 (3DGS와 동일)
[렌더러]: 미분 가능 래스터라이저 — RGB, 깊이, 법선 동시 렌더링

[핵심 추가]:
1. Isotropic Regularization: 가우시안이 너무 길쭉해지는 것 방지
2. Depth Smoothness: 렌더링 깊이의 공간적 일관성
3. Joint Optimization: 포즈 + 가우시안 파라미터 동시 최적화
\`\`\`

### RGB-only Tracking
\`\`\`
깊이 GT 없이 카메라 포즈를 추적하는 방법:

for iter in range(tracking_iters):
    I_render, D_render = render(gaussians, pose_current)

    L_track = L_photo + λ_d * L_depth_consistency

    L_photo = (1-λ)*L1(I_render, I_gt) + λ*L_SSIM(I_render, I_gt)

    # 깊이 일관성: 인접 키프레임의 렌더링 깊이 간 일관성
    L_depth_consistency = geometric_reprojection_loss(
        D_render, D_prev_keyframe, T_relative
    )

    pose_current -= lr * ∂L/∂pose
\`\`\`

### RGB-only Mapping
\`\`\`
깊이 센서 없이 가우시안을 정확하게 배치하는 핵심 전략:

1. [초기화]
   - 첫 2프레임: Essential Matrix → 상대 포즈 + 삼각측량 → 초기 포인트
   - 이후: 렌더링 깊이로 새 영역의 3D 위치 추정

2. [Isotropic Regularization]
   L_iso = Σ_i max(s_max_i / s_min_i - κ, 0)
   각 가우시안의 최대/최소 스케일 비율을 κ 이하로 제한
   → 바늘/실 형태의 degenerate 가우시안 방지
   → RGB-only에서 특히 중요 (깊이 없이 형태가 불안정하기 때문)

3. [Depth Regularization]
   L_depth = edge_aware_smoothness(D_render, I_gt)
   = Σ |∂D/∂u| * e^(-|∂I/∂u|) + |∂D/∂v| * e^(-|∂I/∂v|}
   → 이미지 엣지에서는 깊이 불연속 허용, 그 외 smooth

4. [가우시안 pruning]
   - 불투명도 < 0.05 제거
   - 화면 밖으로 벗어난 가우시안 제거
   - 너무 큰 가우시안 분할
\`\`\`

### Joint Optimization (포즈 + 맵 동시)
\`\`\`
SplaTAM: tracking과 mapping이 교대 (alternating)
MonoGS: 키프레임 윈도우에서 포즈와 가우시안을 동시 최적화

min_{poses, gaussians} Σ_k L_photo_k + λ_iso * L_iso + λ_depth * L_depth

→ 포즈 오차가 맵에 전파되는 것을 줄이고, 맵 개선이 포즈도 개선
\`\`\`

### 정량적 결과
- **Replica (RGB-only)**: ATE RMSE 0.53cm, PSNR 31.2
- **TUM-RGBD (RGB-only)**: ATE RMSE 1.5cm
- **ScanNet**: ATE RMSE 5.8cm
- SplaTAM RGB-D (0.36cm) 대비 약간 낮지만, **깊이 센서 없이** 달성
- DROID-SLAM (RGB-only 전통): ATE 유사, 하지만 DROID는 렌더링 불가
- 렌더링: 150+ FPS (3DGS 래스터라이저)`,
  },
  {
    id: "scannet",
    title:
      "ScanNet: Richly-annotated 3D Reconstructions of Indoor Scenes",
    group: "cvpr",
    venue: "CVPR 2017",
    year: 2017,
    paperUrl: "https://arxiv.org/abs/1702.04405",
    codeUrl: "https://github.com/ScanNet/ScanNet",
    tagKo: "데이터셋",
    oneLineKo:
      "실내 3D 재구성의 표준 벤치마크 데이터셋. 1,500+ 실내 장면 포함.",
    summaryKo: `## ScanNet: Richly-annotated 3D Reconstructions of Indoor Scenes

### 데이터셋 구성
- **1,513개 실내 장면**, 2.5M개 RGB-D 프레임 (Structure Sensor + iPad)
- 각 장면: RGB-D 비디오 시퀀스 + 카메라 포즈 (BundleFusion으로 추정) + 3D 메쉬 재구성
- **20개 시맨틱 클래스**: wall, floor, cabinet, bed, chair, sofa, table, door, window, bookshelf, picture, counter, desk, curtain, refrigerator, shower curtain, toilet, sink, bathtub, otherfurniture
- **인스턴스 분할 어노테이션**: 같은 클래스의 개별 물체 구분 (chair_1, chair_2 등)
- **ScanNet v2** (2018): 추가 장면 + 더 정밀한 어노테이션

### 데이터 수집 파이프라인
\`\`\`
1. Structure Sensor (RGB-D) + iPad로 실내 촬영 (30fps)
2. BundleFusion으로 실시간 카메라 추적 + TSDF 볼륨 fusion
3. Marching Cubes로 메쉬 추출
4. 웹 기반 어노테이션 도구 (Amazon Mechanical Turk)로 시맨틱/인스턴스 레이블링
5. 레이블이 3D 메쉬 → 2D 프레임으로 자동 투영
\`\`\`

### 벤치마크 태스크 및 평가 지표
**1. 3D Semantic Segmentation**
- 메쉬의 각 꼭짓점/면에 시맨틱 클래스 예측
- 지표: mIoU (mean Intersection over Union)

**2. 3D Instance Segmentation**
- 개별 물체 단위로 분할
- 지표: AP25, AP50 (Average Precision at IoU threshold 0.25/0.5)

**3. 3D Object Detection**
- 3D 바운딩 박스 예측
- 지표: AP25, AP50

**4. Scene Reconstruction Quality**
- 재구성된 메쉬의 기하학적 정확도
- 지표: Accuracy (cm), Completeness (cm), Chamfer Distance

**5. Camera Pose Estimation**
- ATE RMSE (Absolute Trajectory Error)

### 왜 중요한가
거의 모든 실내 3D 관련 논문이 ScanNet으로 평가합니다:
- SLAM 논문 → ATE RMSE 비교 (SplaTAM, NICE-SLAM 등)
- 깊이 추정 → AbsRel 비교 (Depth Anything, Metric3D 등)
- 3D 재구성 → Chamfer Distance 비교 (NeuS2, MonoSDF 등)
- 장면 이해 → mIoU/AP 비교 (PointNet, Mask3D 등)

### ScanNet++ (2023)
- iPhone LiDAR + DSLR로 460개 장면 재수집
- 기존 대비 **10배 높은 해상도** 메쉬, 1000+ 시맨틱 클래스
- COLMAP SfM + Metashape MVS로 고정밀 재구성`,
  },
  {
    id: "bundlesdf",
    title:
      "BundleSDF: Neural 6-DoF Tracking and 3D Reconstruction of Unknown Objects",
    group: "cvpr",
    venue: "CVPR 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2303.14158",
    tagKo: "물체 재구성",
    oneLineKo:
      "카메라로 물체를 촬영하면서 실시간으로 6DoF 추적 + 3D 메쉬 재구성.",
    summaryKo: `## BundleSDF: Neural 6-DoF Tracking and 3D Reconstruction of Unknown Objects

### 시스템 개요
**미지의 물체**를 RGB-D 시퀀스로 촬영하면서 실시간으로 (1) 물체의 6-DoF 포즈를 추적하고, (2) Neural SDF로 3D 형상을 점진적으로 재구성하는 통합 시스템.

### 3단계 파이프라인

**1단계: 프레임 단위 포즈 초기화**
\`\`\`
- 이전 프레임 포즈를 초기값으로 설정
- 현재 프레임의 물체 마스크를 SAM/SegmentAnything 또는 사전 분할로 추출
- 마스크 내 깊이 포인트클라우드를 ICP(Iterative Closest Point)로 정합
- 결과: 프레임 간 상대 포즈 ΔT ∈ SE(3)
\`\`\`

**2단계: Neural Object Field (NeuS 기반)**
\`\`\`
- 물체를 SDF + Radiance field로 표현
- 네트워크: MLP (8 레이어, 히든 256) + hash encoding (Instant-NGP 방식)
- 입력: 3D 좌표 x → 출력: SDF 값 s(x), 색상 c(x,d)
- 볼륨 렌더링: NeuS의 SDF→밀도 변환 함수 사용
  σ(x) = max(-∂Φ_s(s(x))/∂t / Φ_s(s(x)), 0)
  여기서 Φ_s는 learnable Sigmoid 함수
\`\`\`

**3단계: Pose Graph Optimization (Bundle Adjustment)**
\`\`\`
- 키프레임 집합에서 Neural Object Field를 공유 표현으로 사용
- 렌더링 기반 loss로 모든 키프레임의 포즈를 공동 최적화:
  L_BA = Σ_k (L_color_k + λ_d * L_depth_k + λ_s * L_sdf_k)
- SDF 정규화: L_sdf = ||∇s(x)|| - 1 (Eikonal loss)
- 주기적으로 (매 20프레임) 전체 BA 수행
\`\`\`

### 손실 함수 상세
\`\`\`
L = L_color + λ_d * L_depth + λ_e * L_eikonal + λ_m * L_mask

L_color = ||C_render - C_gt||₁                    # 색상 L1
L_depth = ||D_render - D_gt||₁                     # 깊이 L1
L_eikonal = (||∇_x SDF(x)|| - 1)²                 # SDF 그래디언트 = 1 제약
L_mask = BCE(S_render, M_gt)                        # 실루엣 vs 물체 마스크
\`\`\`

### 학습 방식
- **온라인 학습**: 사전학습 없음. 촬영하면서 실시간으로 Neural Object Field 학습
- 매 프레임: tracking 30 iter + mapping 10 iter
- 매 20프레임: BA 50 iter (모든 키프레임 포즈 + SDF 공동 최적화)

### 정량적 결과
- **YCB-Video**: ADD-S AUC 93.2 (BundleTrack: 90.8, PoseRBPF: 88.3)
- **HO3D (hand-object)**: MSSD AUC 78.5
- **재구성 품질**: Chamfer Distance 1.1mm (GT 스캔 대비)
- 추론 속도: 10 FPS (tracking) + 오프라인 BA`,
  },
  {
    id: "pixelsplat",
    title: "pixelSplat: 3D Gaussian Splats from Image Pairs for Scalable Generalizable 3D Reconstruction",
    group: "cvpr",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.12337",
    codeUrl: "https://github.com/dcharatan/pixelsplat",
    tagKo: "피드포워드 3DGS",
    oneLineKo:
      "이미지 2장 → 즉시 3DGS 생성. 최적화 없이 한 번의 추론으로 3D.",
    summaryKo: `## pixelSplat: 3D Gaussian Splats from Image Pairs

### Per-scene optimization vs Feed-forward
\`\`\`
기존 3DGS: 이미지 N장 → COLMAP → 수만 iteration 최적화 → 1개 장면
  시간: 수십 분, 장면마다 처음부터

pixelSplat: 이미지 2장 → 트랜스포머 1회 추론 → 3DGS (가우시안 집합)
  시간: ~0.1초, 새 장면에 즉시 적용 (generalization)
\`\`\`

### 아키텍처
\`\`\`
[Image Encoder] — 에피폴라 어텐션 기반
  입력: 이미지 쌍 (I1, I2) + 카메라 포즈 (K1, R1, t1), (K2, R2, t2)
  백본: ViT 또는 ResNet → 멀티스케일 특징 F1, F2

  에피폴라 크로스 어텐션:
    이미지1의 각 픽셀이 이미지2의 에피폴라 라인 위의 픽셀들만 attend
    → 기하학적으로 유효한 대응점만 탐색 (O(N) vs 전체 O(N²))
    → 스테레오 매칭과 유사하지만 학습 기반

[Gaussian Parameter Prediction]
  각 이미지의 각 픽셀에서 가우시안 파라미터 예측:
    per-pixel MLP head:
      F_i(u,v) → μ(깊이 → 3D 위치), Σ(공분산), c(색상 SH), α(불투명도)

  깊이 파라미터화 (핵심):
    μ = K^(-1) * [u,v,1] * d(u,v)  # 예측된 깊이로 3D 위치 계산
    d(u,v) = depth_head(F_i(u,v))  # 각 픽셀의 깊이 예측

  → 이미지1에서 HxW개 + 이미지2에서 HxW개 = 2HW개 가우시안 생성
\`\`\`

### 깊이 예측: 확률적 접근
\`\`\`
문제: 단일 깊이 값 예측은 불확실한 영역(텍스처 부족, 가려짐)에서 불안정

해결: 깊이를 확률 분포로 예측
  p(d|u,v) = Mixture of Logistics 분포
  각 픽셀: K개 모드의 혼합 (K=8)
    각 모드: (weight_k, mean_k, scale_k)

학습 시: 분포에서 깊이 샘플링 (reparameterization trick)
  → 불확실한 영역은 분산이 큰 분포 → 여러 깊이에 가우시안 배치
  → 결과적으로 반투명 영역이나 얇은 구조를 더 잘 표현
\`\`\`

### 손실 함수
\`\`\`
L = L_render + λ * L_lpips

학습 과정:
  1. 이미지 쌍 (I1, I2) → 가우시안 예측
  2. 가우시안을 novel view의 카메라에서 래스터라이즈 → I_render
  3. GT novel view I_gt와 비교

L_render = (1-λ_s)*L1(I_render, I_gt) + λ_s*L_SSIM
L_lpips = LPIPS(I_render, I_gt)  # perceptual loss

학습: RealEstate10K (실내 비디오) + ACID (실외) 데이터셋
\`\`\`

### DUSt3R과의 비교
\`\`\`
DUSt3R: 이미지 쌍 → 포인트맵 (3D 좌표) → 포인트 클라우드
  후처리 필요: 포인트 → 가우시안/메쉬 변환

pixelSplat: 이미지 쌍 → 3DGS (가우시안) 직접 출력
  후처리 불필요: 바로 렌더링 가능

pixelSplat 장점: 즉시 렌더링 가능, view synthesis 품질 높음
DUSt3R 장점: 기하학적 정확도 높음, 많은 이미지 정합(global alignment) 지원
\`\`\`

### 정량적 결과
- **RealEstate10K**: PSNR 25.89, SSIM 0.858, LPIPS 0.142
- **ACID**: PSNR 28.14
- 추론: 이미지 쌍당 ~0.1초 (A100), 가우시안 ~130K개 생성
- 후속: MVSplat (더 많은 입력 뷰), Splatt3R (DUSt3R + pixelSplat 결합)`,
  },

  // ─── ICCV ──────────────────────────────────────────
  {
    id: "neus2",
    title: "NeuS2: Fast Learning of Neural Implicit Surfaces for Multi-view Reconstruction",
    group: "iccv",
    venue: "ICCV 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2212.05231",
    codeUrl: "https://github.com/19reborn/NeuS2",
    tagKo: "표면 재구성",
    oneLineKo:
      "NeuS의 후속. 빠른 학습으로 고품질 3D 메쉬(표면)를 추출.",
    summaryKo: `## NeuS2: Fast Learning of Neural Implicit Surfaces for Multi-view Reconstruction

### NeuS → NeuS2 핵심 변경점
원본 NeuS는 큰 MLP (8레이어, 히든 256)에 positional encoding → 학습 8~12시간. NeuS2는 Instant-NGP의 **multi-resolution hash encoding**을 SDF 학습에 적용하여 **수 분**으로 단축.

### 아키텍처
\`\`\`
입력: 3D 좌표 x ∈ R³

[Multi-resolution Hash Grid]
  L=16 레벨, 각 레벨 해상도 16→2048 (기하급수적 증가)
  해시 테이블 크기 T=2^19, 특징 차원 F=2
  → 총 특징: 16 × 2 = 32차원

[SDF MLP]: 32차원 → 히든(64) × 1레이어 → SDF 값 s(x) + 기하 특징 f_geo(15차원)
[Color MLP]: f_geo + view_dir(SH 인코딩) → 히든(64) × 2레이어 → RGB
\`\`\`

### NeuS의 SDF→밀도 변환 (공통)
\`\`\`
σ(t) = max( -dΦ_s(f(r(t)))/dt  /  Φ_s(f(r(t))), 0 )

여기서:
  Φ_s(x) = (1 + e^(-sx))^(-1)  # Sigmoid, s는 learnable 역온도 파라미터
  f(x) = SDF 값

볼륨 렌더링:
  C(r) = Σ_i T_i * α_i * c_i
  T_i = Π_{j<i} (1 - α_i)
  α_i = max(Φ_s(f(t_i)) - Φ_s(f(t_{i+1})), 0) / Φ_s(f(t_i))

핵심: s가 커질수록 (학습 진행) 밀도 분포가 SDF=0 표면에 집중 → 날카로운 표면
\`\`\`

### Progressive Training (점진적 학습)
\`\`\`
1. 초기: 해시 그리드의 저해상도 레벨만 활성화 (L=1~4)
   → 대략적인 형상 학습 (구체에 가까운 초기 SDF)
2. 점진적으로 고해상도 레벨 활성화 (L=5→8→12→16)
   → 세밀한 디테일 추가
3. 각 단계에서 새 레벨의 해시 테이블을 0으로 초기화
\`\`\`
이 전략 없이 모든 레벨을 동시 학습하면 초기 SDF가 불안정 → 표면에 구멍 발생.

### 손실 함수
\`\`\`
L = L_color + λ_1 * L_eikonal + λ_2 * L_mask

L_color = ||C_render - C_gt||₁
L_eikonal = Σ_x (||∇_x SDF(x)||₂ - 1)²     # SDF 그래디언트 크기 = 1 제약
L_mask = BCE(O_render, M_gt)                    # 물체 마스크 supervision (있을 경우)
\`\`\`

### Incremental Reconstruction (실시간 확장)
NeuS2는 **증분적(incremental) 재구성**도 지원:
- 새 이미지가 들어오면 기존 해시 그리드에서 해당 영역만 업데이트
- SLAM과 유사한 온라인 방식 가능
- 기존 영역의 품질을 유지하면서 새 영역 추가

### 정량적 결과
- **DTU 데이터셋**: Chamfer Distance 0.94mm (NeuS: 1.37mm, Instant-NGP: 1.29mm)
- **학습 시간**: DTU 기준 ~5분 (NeuS: ~8시간, Instant-NGP: ~5분이지만 메쉬 품질 낮음)
- **BlendedMVS**: CD 2.1mm
- 메쉬 추출: Marching Cubes (512³ 해상도)로 SDF=0 등위면 추출, ~10초`,
  },
  {
    id: "neuralangelo",
    title: "Neuralangelo: High-Fidelity Neural Surface Reconstruction",
    group: "iccv",
    venue: "CVPR 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2306.03092",
    codeUrl: "https://github.com/NVlabs/neuralangelo",
    tagKo: "표면 재구성",
    oneLineKo:
      "Instant-NGP + NeuS 결합. 사진만으로 건축물급 고정밀 3D 메쉬 추출.",
    summaryKo: `## Neuralangelo: High-Fidelity Neural Surface Reconstruction

### NeuS와의 관계
NeuS: PE + 큰 MLP → SDF 학습 (8시간, 중간 품질 메쉬)
NeuS2: Hash Encoding + 작은 MLP → 빠름 (5분), 하지만 메쉬 디테일 부족
Neuralangelo: Hash Encoding + **수치적 그래디언트 + coarse-to-fine** → 빠르면서도 고정밀 메쉬

### 핵심 문제: Hash Encoding + SDF의 불안정성
\`\`\`
Instant-NGP의 hash encoding을 SDF에 직접 적용하면:
- 해시 충돌로 SDF 표면이 불연속적
- 해석적 그래디언트 ∇SDF가 노이즈가 심함 → Eikonal loss 불안정
- 결과: 메쉬에 구멍, 울퉁불퉁한 표면
\`\`\`

### 핵심 기법 1: Numerical Gradient (수치적 그래디언트)
\`\`\`
기존 (해석적):
  ∇f(x) = ∂f/∂x  (autograd로 계산)
  문제: hash grid의 trilinear interpolation 경계에서 불연속

Neuralangelo (수치적):
  ∇f(x) ≈ [f(x+εe_1)-f(x-εe_1), f(x+εe_2)-f(x-εe_2), f(x+εe_3)-f(x-εe_3)] / (2ε)
  ε = hash grid의 현재 활성 레벨의 격자 간격

장점:
  - 해시 충돌 경계를 넘어 smooth한 그래디언트
  - ε가 smoothing 역할 → 노이즈 감소
  - Eikonal loss가 안정적으로 동작
\`\`\`

### 핵심 기법 2: Progressive Hash Grid Activation
\`\`\`
NeuS2와 유사하지만 더 체계적:

schedule:
  step 0~5K:      Level 1~4 활성화 (해상도 16~64)
  step 5K~20K:    Level 5~8 추가 (64~256)
  step 20K~50K:   Level 9~12 추가 (256~1024)
  step 50K~100K:  Level 13~16 추가 (1024~4096)

각 단계에서:
  - ε를 현재 최고 활성 레벨의 격자 간격으로 설정
  - 저해상도에서 대략적 형상 확정 → 고해상도에서 디테일 추가
  - 이전 단계의 결과가 다음 단계의 초기값 역할
\`\`\`

### 아키텍처
\`\`\`
[Multi-resolution Hash Grid]
  L=16 레벨, T=2^22 (NeuS2보다 큰 테이블)
  해상도: 16 → 4096 (기하급수)
  특징 차원: F=8 (NeuS2의 2보다 큼 → 더 풍부한 표현)

[SDF MLP]
  입력: hash 특징 (128차원 = 16×8)
  네트워크: 2레이어, 히든 256
  출력: SDF 값 + 기하 특징

[Color MLP]
  입력: 기하 특징 + view direction (SH 인코딩)
  네트워크: 2레이어, 히든 256
  출력: RGB

[Volume Rendering]: NeuS와 동일한 SDF→밀도 변환
\`\`\`

### 손실 함수
\`\`\`
L = L_color + λ_e * L_eikonal + λ_c * L_curvature

L_color = ||C_render - C_gt||₁

L_eikonal = E[(||∇_numerical f(x)|| - 1)²]
  → 수치적 그래디언트 사용으로 안정적

L_curvature = E[||∇²f(x)||]  (Laplacian of SDF)
  → 표면 곡률을 최소화하여 smooth한 표면 유도
  → 특히 텍스처 없는 영역에서 효과적
\`\`\`

### 정량적 결과
- **DTU**: Chamfer Distance 0.37mm (NeuS: 1.37mm, NeuS2: 0.94mm, Instant-NGP: 1.29mm)
  → NeuS 대비 **3.7배** 정밀
- **Tanks and Temples**: F-score 0.72 (NeuS: 0.31) → 대규모 장면에서 압도적
- 학습 시간: A100에서 ~2시간 (NeuS: ~8시간, 하지만 품질은 4배 좋음)
- 메쉬 해상도: 2048³ Marching Cubes → 건축물 수준 디테일`,
  },
  {
    id: "dpt",
    title: "Vision Transformers for Dense Prediction",
    group: "iccv",
    venue: "ICCV 2021",
    year: 2021,
    paperUrl: "https://arxiv.org/abs/2103.13413",
    codeUrl: "https://github.com/isl-org/DPT",
    tagKo: "깊이 추정",
    oneLineKo:
      "Vision Transformer를 깊이 추정에 적용. Depth Anything의 기반이 된 구조.",
    summaryKo: `## DPT: Vision Transformers for Dense Prediction

### CNN vs ViT for Dense Prediction
CNN 기반 인코더 (ResNet 등)의 한계: receptive field가 레이어 수에 비례하여 점진적으로 증가 → 깊이 추정 시 먼 영역 간의 관계를 포착하기 어려움. 예: 방의 좌측 벽과 우측 벽의 깊이 일관성.

ViT: 첫 레이어부터 **모든 패치 간 self-attention** → 전역 맥락을 즉시 반영. 방 전체의 구조를 한 번에 파악.

### 아키텍처
\`\`\`
[ViT Encoder]
  입력: 이미지 H×W×3 → 패치 분할 (16×16) → N = H*W/256개 토큰
  ViT-Base: 12 레이어, 히든 768, 12 헤드
  ViT-Large: 24 레이어, 히든 1024, 16 헤드
  중간 레이어에서 4개 특징 추출: {t_l | l ∈ {3, 6, 9, 12}} (Base 기준)

[Reassemble 모듈] — 토큰을 2D 특징맵으로 변환
  각 레이어 l의 토큰 t_l (N×D):
  1. Read: [CLS] 토큰 처리 (project + add, ignore, 또는 별도 projection)
  2. Concatenate: N개 패치 토큰을 √N × √N × D로 reshape
  3. Resample: 1×1 conv로 채널 조정 + 해상도 변경
     → s1: ×4 upsample (H/4 × W/4)
     → s2: ×2 upsample (H/8 × W/8)  (오타 아님: 원본 패치 해상도 H/16 기준)
     → s3: ×1 (H/16 × W/16)
     → s4: ×0.5 downsample (H/32 × W/32)

[Fusion 모듈] — 멀티스케일 특징 결합
  Bottom-up 방식:
  f4 = ResConv(Reassemble(t_12))
  f3 = ResConv(Reassemble(t_9) + Upsample(f4))
  f2 = ResConv(Reassemble(t_6) + Upsample(f3))
  f1 = ResConv(Reassemble(t_3) + Upsample(f2))

  ResConv: ReLU → 3×3 Conv → ReLU → 3×3 Conv + residual

[Head]: f1 (H/2 × W/2) → 1×1 Conv → Upsample(×2) → H×W 깊이맵
\`\`\`

### MiDaS와의 관계
DPT는 **MiDaS v3의 백본**으로 사용됩니다:
- MiDaS v1/v2: ResNeXt-101 인코더
- MiDaS v3.0: DPT-Large (ViT-L) 인코더
- MiDaS v3.1: DPT + BEiT/Swin2 변형 추가
- Depth Anything: DPT 디코더 + DINOv2 인코더 (DPT 구조를 그대로 계승)

### 학습
- **Mixed dataset training** (MiDaS 방식): 10개 데이터셋 혼합 (ReDWeb, HRWSI, BlendedMVS, NYUv2, KITTI 등)
- **Scale-shift invariant loss**: 데이터셋마다 깊이 스케일이 달라서 정규화 필요
\`\`\`
d* = (d - median(d)) / (mean(|d - median(d)|) + ε)
L = (1/M) Σ |d*_pred - d*_gt|  # Affine-invariant MAE
\`\`\`
- Adam, lr=1e-5, 60 epochs, 배치 16

### 정량적 결과
- **NYUv2**: δ1 0.904 (이전 SOTA MiDaS-ResNeXt: 0.885)
- **KITTI**: AbsRel 0.062 (MiDaS-ResNeXt: 0.073)
- **제로샷 전이**: 학습에 없는 데이터셋에서도 일관되게 우수
- ViT-Large → ViT-Hybrid (ResNet50 + ViT) 변형도 제공 (속도/품질 트레이드오프)`,
  },
  {
    id: "depth-pro",
    title: "Depth Pro: Sharp Monocular Metric Depth in Less Than a Second",
    group: "iccv",
    venue: "arXiv 2024 (Apple)",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2410.02073",
    codeUrl: "https://github.com/apple/ml-depth-pro",
    tagKo: "깊이 추정",
    oneLineKo:
      "Apple의 초고속 metric depth 모델. 0.3초만에 경계가 선명한 미터 단위 깊이맵.",
    summaryKo: `## Depth Pro: Sharp Monocular Metric Depth in Less Than a Second

### Depth Anything V2 vs Depth Pro
\`\`\`
Depth Anything V2:
  - 상대적 깊이 기본, metric은 fine-tune 필요
  - 경계가 부드러움 (blurry boundaries)
  - DINOv2 + DPT 디코더

Depth Pro:
  - 처음부터 metric depth (미터 단위) 출력
  - 경계가 매우 선명 (sharp boundaries)
  - 멀티스케일 ViT + 전용 디코더
  - 카메라 intrinsic 없이도 동작 (focal length도 예측)
\`\`\`

### 아키텍처: Multi-scale ViT Encoder
\`\`\`
입력: 임의 해상도 이미지 (1536×1536으로 리사이즈)

[Multi-scale Feature Extraction]
  원본 이미지를 3개 스케일로 처리:
  Scale 1: 전체 이미지 (384×384 패치로) → ViT → 전역 특징
  Scale 2: 2×2 타일로 분할, 각각 → ViT → 중간 특징
  Scale 3: 4×4 타일로 분할, 각각 → ViT → 디테일 특징

  ViT: DINOv2 ViT-L 기반 (사전학습)
  핵심: 같은 ViT를 다른 스케일에 재사용 (weight sharing)
  → 전역 구조(Scale 1) + 로컬 디테일(Scale 3) 동시 포착

[Decoder]
  멀티스케일 특징을 점진적으로 결합:
  f3 → Upsample + Fuse(f2) → Upsample + Fuse(f1) → 최종 깊이맵

  Sharp Transfer: 인코더의 고해상도 특징을 skip connection으로 디코더에 전달
  → 경계 선명도 유지의 핵심

[Focal Length Prediction Head]
  전역 특징(Scale 1) → MLP → focal length 예측
  → 카메라 intrinsic 없이도 metric depth 출력 가능
\`\`\`

### 학습 전략
\`\`\`
1단계: 상대적 깊이 사전학습
  - 대규모 혼합 데이터 (MiDaS 방식)
  - Scale-shift invariant loss

2단계: Metric depth fine-tuning
  - Metric 깊이가 있는 데이터만 (Hypersim, ScanNet, DIODE 등)
  - Si-Log loss + gradient matching loss

[Sharp Boundary Training]
  핵심: 경계 선명도를 위한 특수 loss
  L_boundary = ||∇D_pred - ∇D_gt||₁  (깊이맵 그래디언트 매칭)
  + 합성 데이터 (Hypersim)에서 pixel-perfect 경계 supervision
\`\`\`

### 손실 함수
\`\`\`
L = L_silog + λ_g * L_gradient + λ_n * L_normal

L_silog = √(E[(log d_pred - log d_gt)²] - λ*(E[log d_pred - log d_gt])²)
L_gradient = ||∇D_pred - ∇D_gt||₁   # 경계 선명도
L_normal = 1 - <n_from_depth_pred, n_from_depth_gt>  # 깊이→법선 일관성
\`\`\`

### 정량적 결과
- **NYUv2 (실내)**: AbsRel 0.036, δ1 0.994 (Depth Anything V2: 0.043, δ1 0.988)
- **KITTI**: AbsRel 0.044
- **Boundary F1 Score**: 0.89 (Depth Anything V2: 0.76) → **경계 선명도에서 압도적**
- **Focal Length 예측**: 상대 오차 <5% (대부분 카메라)
- 추론 속도: **0.3초** @ 1536×1536 (A100), Depth Anything V2 대비 약간 느리지만 metric + sharp
- 모델 크기: ~500M 파라미터`,
  },
  {
    id: "zip-nerf",
    title: "Zip-NeRF: Anti-Aliased Grid-Based Neural Radiance Fields",
    group: "iccv",
    venue: "ICCV 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2304.06706",
    tagKo: "NeRF (최고 품질)",
    oneLineKo:
      "Mip-NeRF 360 + Instant-NGP 결합. 빠른 학습 + 최고 렌더링 품질.",
    summaryKo: `## Zip-NeRF: Anti-Aliased Grid-Based Neural Radiance Fields

### 두 세계의 결합
\`\`\`
Mip-NeRF 360: 최고 품질 렌더링, 하지만 느림 (TPU 48시간)
  핵심: IPE (Integrated Positional Encoding) → 멀티스케일 안티앨리어싱

Instant-NGP: 매우 빠름 (5초), 하지만 앨리어싱 + 품질 한계
  핵심: Hash Grid Encoding → GPU 효율적

Zip-NeRF = Mip-NeRF 360의 앨리어싱 해결 + Instant-NGP의 속도
  → 빠르면서 (1시간) 최고 품질
\`\`\`

### 핵심 문제: IPE와 Hash Grid의 비호환성
\`\`\`
Mip-NeRF의 IPE는 연속 함수(sin/cos)에 대한 기대값 → 해석적 계산 가능
Hash Grid는 이산적 룩업 테이블 → 가우시안 구간의 기대값을 해석적으로 계산 불가
→ 직접 결합 불가능
\`\`\`

### 해결: Multisampling + Weighted Averaging
\`\`\`
Mip-NeRF의 cone casting을 hash grid에 적용하는 근사:

1. 각 구간의 가우시안 N(μ, Σ)에서 K개 점을 샘플링
   x_1, x_2, ..., x_K ~ N(μ, Σ)

2. 각 점을 hash grid에 쿼리
   f_k = HashGridLookup(x_k)

3. 가우시안 가중 평균으로 구간 특징 계산
   f_avg = (1/K) * Σ_k f_k

문제: K가 커야 정확 → 느림
해결: K=6만 사용하되, 특수한 배치로 효율 극대화
  - hexagonal sampling pattern (정육면체 꼭짓점)
  - 이전 구간의 샘플을 재사용
\`\`\`

### Z-aliasing 해결: Hash Grid Supersampling
\`\`\`
추가 문제: 같은 해시 그리드 해상도에서도 레이 방향에 따라 앨리어싱 발생

해결: 각 hash grid 레벨에서 멀티스케일 쿼리
  저해상도 레벨: 넓은 구간의 특징 (배경용)
  고해상도 레벨: 좁은 구간의 특징 (전경용)

  스케일 매칭: 구간 크기와 격자 해상도가 일치하는 레벨만 활성화
  → Mip-NeRF의 IPE와 유사한 효과를 이산 격자에서 달성
\`\`\`

### 아키텍처
\`\`\`
Mip-NeRF 360 구조 유지:
  - Proposal MLP 2개 (경량, 밀도만)
  - NeRF MLP 1개 (정밀, 색상+밀도)
  - Scene contraction (unbounded 장면 처리)
  - Distortion loss (floater 방지)

PE → Hash Grid 교체:
  - 각 MLP의 입력을 PE 대신 hash grid 특징으로 교체
  - Multisampling으로 앨리어싱 방지
  - Progressive training 불필요 (hash grid 자체가 멀티스케일)
\`\`\`

### 정량적 결과
- **Mip-NeRF 360 데이터셋**:
  - 실내 PSNR 33.28 (Mip-NeRF 360: 31.72, 3DGS: ~27) → **최고 품질**
  - 실외 PSNR 28.23 (Mip-NeRF 360: 25.37)
- **학습 시간**: 8× TPUv4에서 ~1시간 (Mip-NeRF 360: ~48시간) → **48배 가속**
- **렌더링**: ~0.8초/장 (Mip-NeRF 360: ~18초) → 22배 빠름
- 3DGS 대비: 렌더링은 실시간이 아니지만 **품질은 현존 최고**
- 한계: 여전히 per-scene optimization 필요, 실시간 렌더링은 3DGS가 우세`,
  },
  {
    id: "neus",
    title: "NeuS: Learning Neural Implicit Surfaces by Volume Rendering for Multi-view Reconstruction",
    group: "iccv",
    venue: "NeurIPS 2021",
    year: 2021,
    paperUrl: "https://arxiv.org/abs/2106.10689",
    codeUrl: "https://github.com/Totoro97/NeuS",
    tagKo: "표면 재구성",
    oneLineKo:
      "볼륨 렌더링으로 SDF 기반 표면을 학습. 깔끔한 3D 메쉬 추출의 핵심.",
    summaryKo: `## NeuS: Learning Neural Implicit Surfaces by Volume Rendering

### NeRF의 표면 추출 문제
NeRF의 밀도 σ(x)에서 표면을 추출하려면 임계값 설정이 필요 → 임계값에 따라 결과가 크게 변함. 밀도가 표면이 아닌 곳에서도 높을 수 있어 노이즈가 많은 메쉬가 생성됨. NeuS는 **SDF**를 사용하여 표면을 SDF=0 등위면으로 명확히 정의.

### 아키텍처
\`\`\`
SDF Network (f):
  입력: 3D 좌표 x → PE (L=6)
  네트워크: 8레이어 MLP, 히든 256, skip connection at layer 4
  출력: SDF 값 f(x) ∈ R, 기하 특징 z(x) ∈ R^256
  초기화: geometric init (구 형태의 SDF로 시작, SAL 방식)

Color Network (c):
  입력: x, normal n=∇f(x), view direction d, 기하 특징 z(x)
  네트워크: 4레이어 MLP, 히든 256
  출력: 색상 c(x,d) ∈ R³
\`\`\`

### 핵심: SDF → 밀도 변환 (Unbiased Weight Function)
\`\`\`
NeRF 볼륨 렌더링: C(r) = ∫ T(t) * σ(t) * c(t) dt
                   T(t) = exp(-∫₀ᵗ σ(s) ds)

NeuS의 핵심 설계:
  σ(t) 대신 weight function w(t) 정의:
  w(t) = T(t) * ρ(t)

  여기서 ρ(t) = max(-dΦ_s(f(r(t)))/dt / Φ_s(f(r(t))), 0)
  Φ_s(x) = 1/(1 + e^(-sx))  (Logistic CDF, s는 learnable 역온도)

핵심 성질 (unbiased):
  - w(t)의 최대값이 정확히 f(r(t))=0인 지점 (표면)에 위치
  - 이 성질은 어떤 형태의 표면이든 성립 (biased 되지 않음)
  - VolSDF의 Laplace CDF 방식은 이 성질이 보장 안 됨
\`\`\`

### s 파라미터의 역할
\`\`\`
s가 작을 때 (학습 초기):
  - Φ_s가 smooth → 넓은 영역에서 가중치 분포
  - 광선이 표면 근처가 아니어도 색상 정보 수집 가능
  - 대략적인 형상 학습에 유리

s가 클 때 (학습 후기):
  - Φ_s가 step function에 가까움 → 표면 바로 위에서만 가중치
  - 날카로운 표면 경계
  - 디테일 학습

s를 learnable로 두면 자동으로 coarse→fine 진행
\`\`\`

### 손실 함수
\`\`\`
L = L_color + λ * L_eikonal + β * L_mask (선택)

L_color = ||C_render - C_gt||₁
L_eikonal = E_x [(||∇f(x)||₂ - 1)²]   # 유효한 SDF가 되려면 그래디언트 크기=1
L_mask = BCE(Σw_i, M_gt)                 # 물체 마스크가 있을 경우

λ = 0.1, 학습: Adam lr=5e-4, 300K iterations
\`\`\`

### 메쉬 추출
\`\`\`
학습 완료 후:
1. 3D 공간을 512³ 격자로 분할
2. 각 격자점에서 SDF 값 쿼리
3. Marching Cubes 알고리즘으로 SDF=0 등위면 추출 → 삼각형 메쉬
\`\`\`

### 정량적 결과
- **DTU**: Chamfer Distance 1.37mm (IDR: 1.63mm, NeRF에서 메쉬: 1.89mm)
- **BlendedMVS**: 고품질 실내/실외 재구성
- 후속: NeuS2 (속도 대폭 개선), Neuralangelo (해시 인코딩 + NeuS)`,
  },
  {
    id: "mono-depth-survey",
    title: "Monocular Depth Estimation Using Deep Learning: A Review",
    group: "iccv",
    venue: "Survey",
    year: 2022,
    paperUrl: "https://arxiv.org/abs/2209.12292",
    tagKo: "서베이",
    oneLineKo:
      "단안 깊이 추정 분야 전체를 정리한 서베이 논문. 입문에 최적.",
    summaryKo: `## Monocular Depth Estimation Using Deep Learning: A Review

### 분야 개요
단안(monocular) 깊이 추정 = 사진 1장 → 픽셀별 깊이맵. 본질적으로 ill-posed (하나의 2D 이미지에 무한한 3D 해석 가능). 딥러닝이 학습 데이터의 통계적 선험으로 이를 극복.

### 방법론 분류

**1. Supervised (지도 학습)**
- 입력: RGB 이미지, 정답: GT 깊이맵 (LiDAR/RGB-D 센서)
- 대표 모델 계보:
  - Eigen et al. (2014): 최초 CNN 기반, coarse+fine 2단계
  - DORN (2018): ordinal regression으로 깊이를 이산화
  - AdaBins (2021): 적응적 깊이 bin 분류
  - DPT (2021): ViT 기반 → 현재 주류
  - Depth Anything (2024): 대규모 비라벨 데이터 활용

**2. Self-supervised (자기 지도 학습)**
- GT 깊이 없이 학습. 핵심: 스테레오 쌍 또는 비디오의 **photometric consistency**
\`\`\`
원리:
  1. 프레임 t에서 깊이 D_t 예측
  2. 프레임 t의 픽셀을 D_t로 3D에 투영
  3. 카메라 포즈 변환 적용 (t → t+1)
  4. 프레임 t+1로 재투영
  5. L = |I_t(reprojected) - I_{t+1}|  # 재투영 오차 최소화
\`\`\`
- 대표: Monodepth (2017), Monodepth2 (2019), PackNet (2020)
- 장점: GT 깊이 불필요 → 데이터 무한
- 단점: 절대 스케일 모호, 동적 물체 문제, supervised보다 정확도 낮음

**3. Semi-supervised / Pseudo-label**
- Depth Anything 방식: supervised teacher → unlabeled에 pseudo-label → student 학습
- 현재 가장 강력한 접근법

### 주요 평가 지표
\`\`\`
AbsRel = (1/N) Σ |d_pred - d_gt| / d_gt          # 상대 절대 오차
SqRel  = (1/N) Σ (d_pred - d_gt)² / d_gt          # 상대 제곱 오차
RMSE   = √((1/N) Σ (d_pred - d_gt)²)              # 절대 오차
δ_t    = % of max(d_pred/d_gt, d_gt/d_pred) < t    # 임계값 정확도 (t=1.25)
\`\`\`

### 주요 데이터셋
| 데이터셋 | 환경 | 깊이 센서 | 해상도 | 장면 수 |
|---------|------|----------|--------|---------|
| NYUv2 | 실내 | Kinect | 640×480 | 464 |
| KITTI | 실외(운전) | Velodyne LiDAR | 1242×375 | 93K+ 프레임 |
| ScanNet | 실내 | Structure Sensor | 1296×968 | 1513 |
| Hypersim | 실내(합성) | 렌더링 | 1024×768 | 461 |
| DIODE | 실내+실외 | FARO laser | 1024×768 | 8.5K |

### 실내 3D 재구성 관점에서의 핵심 포인트
1. **Relative vs Metric depth**: 대부분 모델은 상대적 깊이만 출력. 3D 재구성에는 metric depth(미터 단위) 필요 → Metric3D, Depth Anything V2 metric 버전 사용
2. **Scale ambiguity 해결**: 카메라 intrinsic 정보 필요. CCT(Metric3D)나 fine-tuning으로 해결
3. **실내 특화 문제**: 반사 표면(거울, 유리), 텍스처 없는 벽, 반복 패턴 → 여전히 어려움
4. **downstream 활용**: 깊이맵 → TSDF fusion, 3DGS 초기화, MonoSDF의 depth prior 등`,
  },

  // ─── ECCV ──────────────────────────────────────────
  {
    id: "nerf",
    title:
      "NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis",
    group: "eccv",
    venue: "ECCV 2020",
    year: 2020,
    paperUrl: "https://arxiv.org/abs/2003.08934",
    codeUrl: "https://github.com/bmild/nerf",
    tagKo: "3D 재구성",
    oneLineKo:
      "모든 것의 시작. 사진 여러 장에서 신경망으로 3D 장면을 표현하는 혁명적 논문.",
    summaryKo: `## NeRF: Representing Scenes as Neural Radiance Fields for View Synthesis

### 아키텍처
\`\`\`
입력: 3D 좌표 x=(x,y,z), 시선 방향 d=(θ,φ)

[Positional Encoding]
  γ(p) = [sin(2^0 πp), cos(2^0 πp), ..., sin(2^(L-1) πp), cos(2^(L-1) πp)]
  좌표: L=10 → 60차원,  방향: L=4 → 24차원

[MLP]
  γ(x) (60D) → FC(256)×4 → FC(256) + skip(γ(x)) → FC(256)×3
  → σ (밀도, 1D) — 방향 독립
  → FC(256) + γ(d)(24D) → FC(128) → RGB (색상, 3D) — 방향 의존

총 파라미터: ~1.2M (coarse) + ~1.2M (fine) = ~2.4M
\`\`\`

### 볼륨 렌더링 (핵심 수식)
\`\`\`
광선: r(t) = o + t*d,  t ∈ [t_near, t_far]

연속 형태:
  C(r) = ∫_{t_n}^{t_f} T(t) * σ(r(t)) * c(r(t), d) dt
  T(t) = exp(-∫_{t_n}^{t} σ(r(s)) ds)

이산 근사 (실제 구현):
  C(r) = Σ_{i=1}^{N} T_i * α_i * c_i
  T_i = Π_{j=1}^{i-1} (1 - α_j)
  α_i = 1 - exp(-σ_i * δ_i)
  δ_i = t_{i+1} - t_i  (샘플 간격)
\`\`\`

### Hierarchical Sampling (2단계 샘플링)
\`\`\`
1단계 (Coarse): 균일하게 64개 점 샘플링
  t_i ~ Uniform(t_n + (i-1)/N * (t_f-t_n),  t_n + i/N * (t_f-t_n))
  Coarse MLP로 가중치 w_i = T_i * α_i 계산

2단계 (Fine): w_i를 PDF로 변환, inverse CDF 샘플링으로 128개 추가 점
  → 밀도가 높은 (= 표면 근처) 영역에 더 많은 샘플 집중
  Fine MLP로 최종 색상 계산 (coarse 64 + fine 128 = 192개 점 사용)
\`\`\`

### 손실 함수
\`\`\`
L = Σ_r [ ||C_coarse(r) - C_gt(r)||² + ||C_fine(r) - C_gt(r)||² ]

배치당 4096개 광선 랜덤 샘플링
별도의 정규화 없음 — 순수 photometric loss만으로 학습
\`\`\`

### 학습 설정
- Optimizer: Adam (lr=5e-4 → 5e-5, exponential decay)
- 학습: 100~300K iterations, V100 1장에서 1~2일
- 입력: 20~100장의 사진 + COLMAP 카메라 포즈
- 해상도: 400×400 ~ 800×800

### 정량적 결과
- **Synthetic NeRF (Blender)**: PSNR 31.01, SSIM 0.947
- **LLFF (실제 장면)**: PSNR 26.50, SSIM 0.811
- 이전 최고 (SRN, LLFF): PSNR ~22~24 → 약 5~7dB 개선

### 근본적 한계 → 후속 연구 맵
| 한계 | 해결 논문 |
|------|----------|
| 학습 느림 (수 시간) | Instant-NGP (수 초), TensoRF |
| 렌더링 느림 (~30초/장) | 3DGS (실시간), PlenOctrees |
| 정확한 포즈 필요 | BARF, Nope-NeRF, DUSt3R |
| 정적 장면만 | D-NeRF, Nerfies, HyperNeRF |
| 앨리어싱 | Mip-NeRF, Zip-NeRF |
| 메쉬 추출 어려움 | NeuS, VolSDF |
| unbounded 장면 | Mip-NeRF 360, NeRF++ |`,
  },
  {
    id: "mastr3r",
    title: "MASt3R: Grounding Image Matching in 3D with MASt3R",
    group: "eccv",
    venue: "ECCV 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2406.09756",
    codeUrl: "https://github.com/naver/mast3r",
    tagKo: "3D 재구성",
    oneLineKo:
      "DUSt3R의 후속. 이미지 매칭을 3D 공간에서 수행하여 정확도 향상.",
    summaryKo: `## MASt3R: Grounding Image Matching in 3D with MASt3R

### DUSt3R → MASt3R 핵심 변경점
DUSt3R: 이미지 쌍 → 3D 포인트맵 예측 (대응점은 implicit). MASt3R: 3D 포인트맵 + **명시적 로컬 특징(local feature) 매칭**을 동시에 학습.

### 아키텍처
\`\`\`
[DUSt3R 백본 (동일)]
  인코더: CroCo ViT-L, 크로스 어텐션 디코더 2개
  출력: 포인트맵 X1, X2 (각 H×W×3), confidence C1, C2

[추가: Local Feature Head]
  디코더 출력 특징 → 1×1 Conv → 정규화 → D차원 특징 벡터 (D=24)
  각 패치마다 f1_i ∈ R^D, f2_j ∈ R^D

[매칭]
  유사도 행렬: S(i,j) = <f1_i, f2_j> / τ  (τ=0.07, 온도)
  매칭: mutual nearest neighbor + ratio test
  또는 soft assignment (학습 시)
\`\`\`

### 학습: Joint Pointmap + Matching Loss
\`\`\`
L = L_pointmap + λ_m * L_matching

L_pointmap (DUSt3R와 동일):
  = Σ_i c_i * ||X_pred_i - X_gt_i||₁ - α * log(c_i)

L_matching (InfoNCE / cross-entropy):
  = -Σ_i log( exp(S(i, i*)) / Σ_j exp(S(i, j)) )
  여기서 i*는 i의 GT 대응점 (3D 좌표 기반으로 계산)

GT 대응점 결정:
  1. GT 포인트맵에서 X1_i와 X2_j의 3D 거리 계산
  2. 거리 < τ_match 인 쌍을 positive로 설정
\`\`\`

### 핵심 insight: 3D가 매칭을 개선하고, 매칭이 3D를 개선
- **3D → 매칭**: 포인트맵이 정확하면 GT 대응점이 정확 → 매칭 supervision 품질 향상
- **매칭 → 3D**: 정확한 대응점이 있으면 global alignment가 더 정확 → 포인트맵 품질 향상
- 이 상호 강화(mutual reinforcement)가 단독 학습 대비 두 태스크 모두 성능 향상

### Global Alignment 개선
DUSt3R의 global alignment (N장 이미지 → 하나의 3D 장면)에서:
\`\`\`
DUSt3R: 포인트맵 정합만으로 정렬 → 텍스처 부족 영역에서 ambiguity
MASt3R: 포인트맵 정합 + 명시적 대응점 제약 추가
  min Σ_{pairs} ||X1_aligned - X2_aligned||² + μ * Σ_{matches} ||X1_m - X2_m||²
  → 대응점이 일치하도록 추가 제약 → 텍스처 없는 영역에서도 안정적
\`\`\`

### 정량적 결과
- **ScanNet 카메라 포즈**: AUC@5° 78.4 (DUSt3R: 73.9, SuperGlue+COLMAP: 72.3)
- **Map-free Relocalization**: +4.5% 개선 (DUSt3R 대비)
- **이미지 매칭 (HPatches)**: MMA@3px 81.2 (SuperPoint+SuperGlue: 78.1, LoFTR: 75.6)
- **3D 재구성 (DTU)**: Chamfer Distance 1.08mm (DUSt3R: 1.24mm)
- 추론 속도: DUSt3R과 거의 동일 (~0.1초/쌍, feature head 오버헤드 무시 가능)`,
  },
  {
    id: "gaussian-room",
    title: "GaussianRoom: Improving 3D Gaussian Splatting for Indoor Scene Reconstruction",
    group: "eccv",
    venue: "ECCV 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2405.19671",
    tagKo: "3DGS + 실내",
    oneLineKo:
      "3DGS를 실내 환경에 최적화. 벽, 바닥 등 평면을 더 정확하게 재구성.",
    summaryKo: `## GaussianRoom: Improving 3D Gaussian Splatting for Indoor Scene Reconstruction

### 실내 3DGS의 문제점
기본 3DGS는 실내에서 3가지 문제 발생:
1. **텍스처 없는 영역** (흰 벽, 천장): 가우시안이 제대로 배치되지 않아 구멍 발생
2. **평면 표현 부정확**: 가우시안이 표면에 정렬되지 않고 공중에 떠다님 → 깊이맵 노이즈
3. **희소 관측 영역**: 코너, 천장 등 촬영 횟수가 적은 곳에서 아티팩트

### 아키텍처 / 파이프라인
\`\`\`
[기본 3DGS 파이프라인]
  COLMAP → 초기 포인트 클라우드 → 3D 가우시안 초기화 → 미분 가능 래스터화 → 최적화

[GaussianRoom 추가 모듈]
  1. Monocular Depth Prior
     - 사전학습 깊이 모델 (Omnidata/DPT)로 각 학습 이미지의 깊이 예측
     - 예측 깊이를 scale-shift 정렬 후 depth supervision으로 사용

  2. Monocular Normal Prior
     - 사전학습 법선 모델 (Omnidata)로 각 이미지의 surface normal 예측
     - 렌더링된 법선과 비교하여 정규화

  3. SDF-guided Gaussian Pruning
     - 학습된 가우시안에서 TSDF를 추출
     - TSDF 표면에서 먼 가우시안 제거 → 부유 아티팩트 제거
\`\`\`

### 손실 함수
\`\`\`
L = L_color + λ_d * L_depth + λ_n * L_normal + λ_s * L_smooth

L_color = (1-λ) * L1(I_render, I_gt) + λ * L_SSIM(I_render, I_gt)  # 기본 3DGS

L_depth = ||D_render - align(D_mono)||₁
  여기서 align: D_mono를 D_render 스케일에 맞춤
  align(d) = a*d + b,  a,b = least squares로 계산

L_normal = 1 - <N_render, N_mono>  # 코사인 유사도
  N_render: 가우시안의 가장 짧은 축 방향 (표면 법선으로 해석)
  N_mono: 사전학습 모델의 법선 예측

L_smooth = Σ_{neighbors} ||n_i - n_j||²  # 인접 가우시안 법선 일관성
\`\`\`

### Gaussian → SDF → Mesh 변환
\`\`\`
1. 학습된 가우시안에서 깊이맵 렌더링 (모든 학습 뷰)
2. 깊이맵들을 TSDF fusion (voxel 크기 ~2cm)
3. Marching Cubes로 메쉬 추출
4. 메쉬를 다시 가우시안 학습의 제약으로 사용 (iterative refinement)
\`\`\`

### 정량적 결과
- **ScanNet (실내 재구성)**:
  - PSNR 28.7 (기본 3DGS: 25.2, +3.5dB)
  - Depth L1: 3.8cm (기본 3DGS: 8.7cm)
  - Normal MAE: 11.2° (기본 3DGS: 22.8°)
- **Replica**: PSNR 33.1, Depth L1 1.2cm
- 메쉬 품질: Chamfer Distance로 NeuS2와 경쟁력 있으면서 렌더링은 3DGS의 실시간 속도 유지
- 벽/바닥 평면 품질이 특히 크게 개선됨`,
  },
  {
    id: "monosdf",
    title: "MonoSDF: Exploring Monocular Geometric Cues for Neural Implicit Surface Reconstruction",
    group: "eccv",
    venue: "NeurIPS 2022",
    year: 2022,
    paperUrl: "https://arxiv.org/abs/2206.00665",
    codeUrl: "https://github.com/autonomousvision/monosdf",
    tagKo: "표면 재구성",
    oneLineKo:
      "단안 깊이/법선 정보를 활용하여 SDF 기반 3D 표면 재구성 품질 향상.",
    summaryKo: `## MonoSDF: Exploring Monocular Geometric Cues for Neural Implicit Surface Reconstruction

### 핵심 문제
NeuS/VolSDF는 색상(photometric) 정보만으로 SDF를 학습. 문제:
- 텍스처 부족 영역: 색상 그래디언트가 없어 SDF 최적화 방향 불명확
- 적은 뷰: 관측되지 않은 방향의 기하학 불안정
- 큰 평면 (벽, 바닥): photometric loss만으로는 깊이 정확도 낮음

MonoSDF의 해결: **사전학습 단안 깊이/법선 모델의 출력을 기하학적 supervision으로 추가**

### 아키텍처 (2가지 백본 지원)
\`\`\`
[Option A: VolSDF 백본]
  SDF MLP: 8레이어, 히든 256, geometric init, PE(L=6)
  Radiance MLP: 4레이어, 히든 256
  밀도 변환: σ(x) = α * Ψ_β(-f(x)), Ψ_β = Laplace CDF

[Option B: NeuS 백본]
  동일한 SDF+Radiance 구조
  밀도 변환: NeuS의 logistic 기반 가중치 함수

[공통: Monocular Prior Integration]
  Omnidata 모델 (DPT-Large 백본)로 사전 추출:
  - 깊이: D_mono ∈ R^(H×W) (affine-ambiguous)
  - 법선: N_mono ∈ R^(H×W×3) (단위 벡터)
\`\`\`

### 손실 함수 상세
\`\`\`
L = L_color + λ_d * L_depth + λ_n * L_normal + λ_e * L_eikonal

1. L_color = ||C_render - C_gt||₁  (기존 NeuS/VolSDF와 동일)

2. L_depth (핵심 추가):
   문제: D_mono는 scale/shift가 unknown → 직접 비교 불가
   해결: per-image scale-shift alignment

   a, b = argmin ||a * D_mono + b - D_render||²  (least squares)
   L_depth = ||D_render - (a * D_mono + b)||₁

   → 절대 깊이 없이도 상대적 깊이 패턴을 supervision으로 활용

3. L_normal:
   렌더링된 법선: N_render = ∇f(x)/||∇f(x)||  (SDF의 그래디언트 = 표면 법선)
   L_normal = 1 - <N_render, N_mono>  (코사인 거리)

   + angular loss: L_ang = arccos(<N_render, N_mono>)

4. L_eikonal = E[(||∇f(x)|| - 1)²]  (SDF 유효성)
\`\`\`

### 실험: Prior 조합별 ablation
\`\`\`
ScanNet에서 Chamfer Distance (cm):
  VolSDF only:          8.25
  + depth prior:        5.12  (-38%)
  + normal prior:       6.41  (-22%)
  + depth + normal:     4.23  (-49%)  ← 두 prior가 상호 보완
\`\`\`

### 정량적 결과
- **ScanNet (실내)**: Chamfer Distance 4.23cm (VolSDF: 8.25cm, COLMAP MVS: 7.14cm)
- **Replica**: CD 2.8cm
- **DTU**: CD 0.83mm (NeuS: 1.37mm → 38% 개선)
- 특히 **텍스처 부족 영역 (흰 벽, 천장)과 적은 뷰 (10~20장)에서 개선 폭 큼**
- 후속 영향: GaussianRoom, DN-Splatter 등이 동일한 mono prior 전략을 3DGS에 적용`,
  },
  {
    id: "lerf",
    title: "LERF: Language Embedded Radiance Fields",
    group: "eccv",
    venue: "ICCV 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2303.09553",
    codeUrl: "https://github.com/kerrj/lerf",
    tagKo: "3D + 언어",
    oneLineKo:
      "3D 장면에서 자연어로 물체 검색 가능. '소파 어디있어?'로 3D에서 찾기.",
    summaryKo: `## LERF: Language Embedded Radiance Fields

### 핵심 아이디어
NeRF의 각 3D 포인트에 RGB/밀도 외에 **CLIP 언어 특징 벡터**를 함께 저장. 학습 완료 후 텍스트 쿼리 → 3D 공간에서 해당 영역 히트맵 생성.

### 아키텍처 (Nerfacto 기반)
\`\`\`
[기존 NeRF 필드]
  x → HashGrid → MLP → density σ, color c

[LERF 추가 필드]
  x → 별도 HashGrid → MLP → CLIP 특징 φ(x) ∈ R^512

[Multi-scale CLIP Supervision]
  핵심 문제: CLIP은 이미지 패치 단위로 작동 → 3D 포인트 단위 supervision 불가
  해결: 멀티스케일 이미지 크롭에서 CLIP 특징 추출

  학습 시:
  1. 학습 이미지에서 다양한 크기의 크롭 생성 (물체 수준, 부분 수준, 장면 수준)
  2. 각 크롭을 CLIP 이미지 인코더에 통과 → φ_clip ∈ R^512
  3. 해당 크롭 영역의 3D 포인트들의 LERF 특징을 볼륨 렌더링으로 집계
  4. 렌더링된 특징과 CLIP 특징의 코사인 유사도 최대화
\`\`\`

### 멀티스케일 처리
\`\`\`
문제: "mug"(작음)와 "kitchen"(큼)은 서로 다른 공간 스케일
해결: 각 3D 포인트에 스케일 파라미터 s(x)도 함께 학습

s(x) → 해당 포인트가 어떤 크기의 물체에 속하는지 나타냄
작은 s: 물체 수준 특징 (mug, keyboard)
큰 s: 영역 수준 특징 (kitchen, living room)

쿼리 시:
  텍스트 → CLIP 텍스트 인코더 → φ_text
  각 3D 포인트: relevancy = cosine_sim(φ(x), φ_text)
  s(x)에 따라 적절한 스케일에서 비교
\`\`\`

### 손실 함수
\`\`\`
L = L_nerf + λ * L_clip

L_nerf: 기존 Nerfacto loss (photometric + distortion + proposal 등)

L_clip = Σ_{crops} (1 - cos_sim(φ_render_crop, CLIP_encode(crop)))

φ_render_crop: 크롭 영역 픽셀들의 LERF 특징을 볼륨 렌더링으로 합산
  = Σ_i T_i * α_i * φ(x_i)  (색상 대신 CLIP 특징을 렌더링)
\`\`\`

### 쿼리 (추론)
\`\`\`
입력: 텍스트 "red chair"
1. CLIP 텍스트 인코더 → φ_text
2. 원하는 뷰에서 각 픽셀로 레이 발사
3. 각 레이: Σ T_i * α_i * cos_sim(φ(x_i), φ_text) → relevancy score
4. 히트맵으로 시각화 → "red chair" 영역이 밝게 표시
\`\`\`

### 정량적 결과
- **LERF Localization Benchmark (자체)**: top-1 accuracy 73.4% (CLIP on rendered views: 51.2%)
- 3D 일관성: 다른 뷰에서 같은 쿼리를 해도 동일 물체 영역을 가리킴 (2D CLIP은 뷰마다 결과 다름)
- 실내 장면에서 "sofa", "bookshelf", "window" 등 가구/구조물 검색 잘 동작
- 후속: LangSplat (3DGS + 언어), OpenScene, Gaussian Grouping 등으로 발전`,
  },
  {
    id: "splat-slam-eccv",
    title: "SplaTAM-S: Dense RGB SLAM with 3D Gaussian Splatting",
    group: "eccv",
    venue: "ECCV 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.02126",
    tagKo: "SLAM",
    oneLineKo:
      "깊이 카메라 없이 RGB만으로 3D Gaussian Splatting SLAM 수행.",
    summaryKo: `## SplaTAM-S: Dense RGB SLAM with 3D Gaussian Splatting

### RGB-D → RGB-only 전환의 핵심 과제
SplaTAM (RGB-D)은 깊이를 직접 사용하여 (1) 가우시안 3D 위치 초기화, (2) tracking loss의 깊이 항. RGB-only에서는 두 가지 모두 대안이 필요.

### 파이프라인 변경점
\`\`\`
[SplaTAM RGB-D]                    [SplaTAM-S RGB-only]
깊이 센서 → 정확한 D_gt          단안 깊이 추정 → D_mono (상대적)
D_gt로 3D 위치 계산              D_mono를 scale-align 후 초기 위치 추정
L_track = L_color + L_depth       L_track = L_color + L_depth_mono + L_smooth
\`\`\`

### 단안 깊이 통합 방법
\`\`\`
1. [초기 깊이 추정]
   - 첫 프레임에서 Depth Anything/DPT로 D_mono 예측
   - D_mono는 affine-ambiguous → 절대 스케일 불명
   - 초기 스케일: 임의 설정 또는 SfM 포인트 기반 정렬

2. [Densification 수정]
   기존: D_gt(u,v)로 정확한 3D 위치 계산
   수정: D_mono를 현재 맵의 깊이 스케일에 정렬 후 사용
     scale, shift = align(D_mono, D_rendered)  # median scaling
     D_init = scale * D_mono + shift
     μ_new = K^(-1) * [u,v,1] * D_init(u,v)

3. [Tracking]
   L_track = L1(I_render, I_gt)
           + λ_ssim * L_SSIM(I_render, I_gt)
           + λ_d * L1(D_render, align(D_mono))  # 정렬된 단안 깊이와 비교
   → 깊이 loss가 weak supervision 역할 (정확한 GT 대신)

4. [Mapping]
   동일하게 mono depth를 추가 loss로 사용
   + 깊이 smoothness regularization:
     L_smooth = Σ |∂D/∂u| * e^(-|∂I/∂u|) + |∂D/∂v| * e^(-|∂I/∂v|}
     → 이미지 엣지에서는 깊이 불연속 허용, 그 외에는 smooth
\`\`\`

### 스케일 드리프트 문제
RGB-only SLAM의 근본적 문제: 절대 스케일 정보 없음 → 시간이 지남에 따라 맵의 스케일이 drift.
\`\`\`
완화 전략:
1. 키프레임마다 mono depth와 렌더링 깊이의 스케일 재정렬
2. Loop closure 감지 시 전역 스케일 보정
3. 첫 N프레임의 스케일을 anchor로 고정
\`\`\`

### 정량적 결과 (RGB-only 기준)
- **Replica**: PSNR 29.8 (RGB-D SplaTAM: 34.1), ATE RMSE 0.82cm (RGB-D: 0.36cm)
- **TUM-RGBD (RGB-only 입력)**: ATE RMSE 2.8cm
- RGB-D 대비 품질 저하는 불가피하지만, **깊이 센서 없이도 동작**한다는 점이 핵심
- 비교: DROID-SLAM(전통 RGB SLAM)의 정확도에 3DGS의 렌더링 품질 추가
- 실용적 의미: iPhone 기본 카메라 (LiDAR 없는 모델)로도 3D 스캔 가능`,
  },
  {
    id: "gaussian-surfels",
    title: "Gaussian Surfels: Geometry-aware 3D Gaussian Splatting for Surface Reconstruction",
    group: "eccv",
    venue: "ECCV 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2404.17774",
    tagKo: "3DGS + 표면",
    oneLineKo:
      "3DGS에 표면 정보를 추가하여 깔끔한 메쉬 추출 가능.",
    summaryKo: `## Gaussian Surfels: Geometry-aware 3D Gaussian Splatting for Surface Reconstruction

### 3DGS의 기하학적 한계
기본 3DGS의 가우시안은 3D 타원체(ellipsoid) → 부피가 있음. 문제:
1. 가우시안이 표면 위에 정렬되지 않고 "떠다님"
2. 깊이 렌더링이 부정확 (가우시안 중심 vs 실제 표면 위치 불일치)
3. 법선 방향이 모호 → 메쉬 추출 시 노이즈

### 핵심: 3D Gaussian → 2D Gaussian (Surfel)
\`\`\`
기본 3DGS 가우시안:
  공분산 Σ = R * S * S^T * R^T
  S = diag(s_x, s_y, s_z)  # 3개 축 스케일

Gaussian Surfel:
  S = diag(s_x, s_y, 0)    # z축 스케일 = 0 (또는 ε → 0)
  → 납작한 2D 디스크
  법선: n = R * [0, 0, 1]^T  (디스크의 법선 = 로컬 z축)

렌더링:
  기존 3DGS: 3D 가우시안을 2D에 투영 (EWA splatting)
  Gaussian Surfel: 2D 디스크를 직접 투영 → ray-disk intersection으로 정확한 깊이 계산
\`\`\`

### 깊이 렌더링 개선
\`\`\`
기존 3DGS 깊이:
  D(p) = Σ_i T_i * α_i * z_i   (z_i = 가우시안 중심의 깊이)
  문제: 가우시안이 크면 중심과 실제 교차점의 깊이가 다름

Gaussian Surfel 깊이:
  D(p) = Σ_i T_i * α_i * z_intersect_i
  z_intersect_i = ray와 디스크 평면의 정확한 교차점 깊이
  → 기하학적으로 정확한 깊이
\`\`\`

### 손실 함수
\`\`\`
L = L_color + λ_d * L_depth + λ_n * L_normal + λ_s * L_smooth

L_color = (1-λ)*L1 + λ*L_SSIM  (기본 3DGS)

L_depth = ||D_render - D_mono||₁  (단안 깊이 prior, scale-aligned)

L_normal = Σ_i w_i * (1 - <n_i, N_mono(π(μ_i))>)
  n_i: 가우시안 i의 법선 (R * [0,0,1])
  N_mono: 사전학습 법선 추정 결과
  w_i: 렌더링 가중치 (T_i * α_i)

L_smooth = Σ_{neighbors} ||n_i - n_j||²  # 인접 서펠 법선 일관성
\`\`\`

### 메쉬 추출 파이프라인
\`\`\`
1. 학습된 서펠에서 모든 학습 뷰의 깊이맵 렌더링
2. 깊이맵 + 카메라 포즈 → TSDF fusion
   - 복셀 크기: 장면에 따라 0.4~2cm
   - truncation distance: 3 * voxel_size
3. Marching Cubes → 삼각형 메쉬
4. (선택) 메쉬 정리: 작은 연결 요소 제거, Laplacian smoothing
\`\`\`

### 2DGS와의 비교
| 항목 | Gaussian Surfels | 2DGS |
|------|-----------------|------|
| 표현 | s_z=0 가우시안 | 2D oriented disk |
| 깊이 | ray-splat intersection | ray-disk intersection |
| 법선 supervision | mono normal prior | 없음 (기하학만으로) |
| 메쉬 추출 | TSDF fusion | TSDF fusion |
| 렌더링 품질 | 약간 우세 (prior 덕분) | 기하학 더 정확 |

### 정량적 결과
- **DTU**: Chamfer Distance 0.55mm (3DGS: 1.13mm, NeuS: 1.37mm, 2DGS: 0.48mm)
- **Tanks and Temples**: F-score 0.61 (3DGS: 0.42)
- **렌더링**: PSNR은 기본 3DGS와 거의 동일 (±0.3dB)
- 핵심: **렌더링 품질을 유지하면서 메쉬 품질을 NeuS 수준으로 끌어올림**`,
  },

  // ─── OTHER (SIGGRAPH, NeurIPS, arXiv, etc.) ──────────────
  {
    id: "3dgs",
    title:
      "3D Gaussian Splatting for Real-Time Radiance Field Rendering",
    group: "other",
    venue: "SIGGRAPH 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2308.14737",
    codeUrl: "https://github.com/graphdeco-inria/gaussian-splatting",
    tagKo: "3D 재구성",
    oneLineKo:
      "NeRF를 대체하는 새로운 패러다임. 3D 가우시안으로 장면을 표현하여 실시간 렌더링.",
    summaryKo: `## 3D Gaussian Splatting for Real-Time Radiance Field Rendering

### 가우시안 파라미터
각 가우시안 G_i는 다음 파라미터로 정의:
\`\`\`
μ_i ∈ R³         — 3D 위치 (중심점)
Σ_i ∈ R^(3×3)   — 3D 공분산 (형태/크기/방향)
  실제 저장: quaternion q ∈ R⁴ (회전) + scale s ∈ R³ (크기)
  Σ = R(q) * diag(s²) * R(q)^T  (양정치 보장)
c_i ∈ R^(k)      — SH 계수 (k = (deg+1)², 기본 deg=3 → 16×3 = 48개)
α_i ∈ R          — 불투명도 (sigmoid로 [0,1] 변환)

총 파라미터/가우시안: 3 + 4 + 3 + 48 + 1 = 59개
장면당 가우시안 수: ~0.5M ~ 5M개
\`\`\`

### 미분 가능 래스터화 (핵심 알고리즘)
\`\`\`
1. [Frustum Culling] 카메라 시야 밖 가우시안 제거

2. [2D Projection] 3D 가우시안을 이미지 평면에 투영
   Σ' = J * W * Σ * W^T * J^T   (J: Jacobian of projection, W: view transform)
   → 2D 가우시안 N(μ', Σ') 생성

3. [Tile-based Sorting]
   이미지를 16×16 타일로 분할
   각 가우시안이 겹치는 타일에 등록
   타일 내에서 깊이 순 정렬 (GPU radix sort)

4. [Alpha Blending (front-to-back)]
   C(p) = Σ_{i=1}^{N} c_i * α_i * G'_i(p) * T_i
   T_i = Π_{j=1}^{i-1} (1 - α_j * G'_j(p))
   G'_i(p) = exp(-0.5 * (p-μ'_i)^T * Σ'^(-1)_i * (p-μ'_i))

   T_i < ε 이면 조기 종료 (saturation)
\`\`\`

### Adaptive Density Control (가우시안 추가/제거)
\`\`\`
매 100 iteration마다:
1. [Clone] 작은 가우시안 + 높은 position gradient
   → 같은 위치에 복제 (under-reconstruction 해결)

2. [Split] 큰 가우시안 + 높은 position gradient
   → 2개로 분할 (각각 스케일 1/1.6) (over-reconstruction 해결)

3. [Prune] α < 0.005 또는 너무 큰 가우시안 제거

4. [Reset] 주기적으로 (3000 iter마다) 모든 α를 낮은 값으로 리셋
   → 불필요한 가우시안이 자연 소멸
\`\`\`

### 손실 함수
\`\`\`
L = (1-λ) * L1(I_render, I_gt) + λ * L_D-SSIM(I_render, I_gt)
λ = 0.2
\`\`\`

### 학습 설정
- Optimizer: 각 파라미터별 개별 Adam
  - position: lr = 0.00016 * scene_extent (exponential decay)
  - SH: lr = 0.0025
  - opacity: lr = 0.05
  - scaling: lr = 0.005
  - rotation: lr = 0.001
- 30,000 iterations, A6000 GPU 기준 ~25분
- 초기화: COLMAP SfM 포인트 (수천~수만 개) → 학습 후 0.5M~5M개

### 정량적 결과
- **Mip-NeRF 360 데이터셋**: PSNR 27.21 (Mip-NeRF 360: 27.69) — 품질 거의 동등
- **렌더링 속도**: 134 FPS @ 1080p (Mip-NeRF 360: 0.06 FPS) — **2000배 빠름**
- **학습 시간**: ~25분 (Mip-NeRF 360: ~48시간) — **100배 빠름**
- **Tanks and Temples**: PSNR 23.14 (Mip-NeRF 360: 22.22)
- 메모리: ~1GB (1M 가우시안 기준)`,
  },
  {
    id: "langsplat",
    title: "LangSplat: 3D Language Gaussian Splatting",
    group: "other",
    venue: "CVPR 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2312.16084",
    codeUrl: "https://github.com/minghanqin/LangSplat",
    tagKo: "3DGS + 언어",
    oneLineKo:
      "3DGS에 언어 특징을 내장. 텍스트로 3D 장면에서 물체 검색 가능.",
    summaryKo: `## LangSplat: 3D Language Gaussian Splatting

### LERF vs LangSplat
\`\`\`
LERF (2023): NeRF + CLIP 특징 → 3D 언어 검색
  한계: NeRF 기반 → 느린 렌더링, 느린 쿼리

LangSplat (2024): 3DGS + SAM + CLIP → 3D 언어 검색
  장점: 실시간 렌더링 + 실시간 쿼리 + 더 정확한 물체 경계
\`\`\`

### 핵심 아이디어: SAM으로 물체 경계 확보 후 CLIP 특징 학습
\`\`\`
LERF의 문제: CLIP은 이미지 패치 단위 → 물체 경계가 부정확
  "mug" 검색 시 주변 테이블까지 활성화

LangSplat의 해결: SAM (Segment Anything)으로 정확한 물체 마스크 획득
  → 마스크 단위로 CLIP 특징 추출 → 물체별로 정확한 언어 특징
\`\`\`

### 파이프라인
\`\`\`
[1단계: 학습 이미지 전처리]
  각 학습 이미지에 대해:
  a) SAM으로 세그멘테이션 → 물체별 마스크 M_1, M_2, ..., M_K
  b) 각 마스크의 바운딩 박스로 이미지 크롭
  c) 크롭된 영역을 CLIP 이미지 인코더에 통과 → φ_k ∈ R^512
  d) 마스크 내 모든 픽셀에 동일한 CLIP 특징 할당

  → 결과: 각 픽셀 (u,v)에 대해 GT CLIP 특징 φ_gt(u,v) ∈ R^512

[2단계: Autoencoder로 차원 축소]
  문제: CLIP 특징 512차원을 각 가우시안에 저장하면 메모리 폭발
  해결: Autoencoder로 512 → 3차원으로 압축

  인코더: φ (512D) → FC(256) → FC(3) → z (3D)
  디코더: z (3D) → FC(256) → FC(512) → φ_hat (512D)
  학습: L_ae = ||φ - φ_hat||² (전체 학습 이미지의 CLIP 특징으로)

[3단계: 3DGS + Language Feature 학습]
  각 가우시안에 추가 파라미터:
    기존: μ, Σ, c(SH), α
    추가: l_i ∈ R³ (압축된 언어 특징)

  렌더링: 색상과 동일한 방식으로 언어 특징도 래스터라이즈
    L_render(p) = Σ_i T_i * α_i * G'_i(p) * l_i

  손실:
    L = L_color + λ_l * L_lang
    L_lang = ||Decode(L_render) - φ_gt||²
\`\`\`

### 쿼리 (추론)
\`\`\`
입력: 텍스트 "red chair"

1. CLIP 텍스트 인코더: "red chair" → φ_text ∈ R^512
2. 원하는 뷰에서 언어 특징맵 래스터라이즈: L_render ∈ R^(H×W×3)
3. 각 픽셀의 압축 특징을 디코더로 복원: φ_pixel = Decode(L_render(u,v))
4. 관련도: relevancy(u,v) = cos_sim(φ_pixel, φ_text)
5. 히트맵으로 시각화 / 임계값으로 3D 바운딩 박스 추출

속도: 래스터라이즈 ~5ms + 디코드 ~2ms = **실시간 쿼리**
\`\`\`

### LERF 대비 장점
| 항목 | LERF | LangSplat |
|------|------|-----------|
| 기반 | NeRF | 3DGS |
| 렌더링 | ~30초/뷰 | ~5ms/뷰 |
| 물체 경계 | 흐릿 (패치 CLIP) | 선명 (SAM 마스크) |
| 메모리 | 512D per-point | 3D per-gaussian |
| 쿼리 속도 | ~30초 | ~7ms (실시간) |
| 정확도 | 73.4% (top-1) | 84.2% (top-1) |

### 정량적 결과
- **LERF 벤치마크**: Localization accuracy 84.2% (LERF: 73.4%) → +10.8%
- **3D 일관성**: 다중 뷰에서 동일 물체 검색 일관성 크게 향상
- 렌더링 속도: 200+ FPS (LERF: ~0.03 FPS)
- 추가 메모리: 가우시안당 3 float (12 bytes) → 1M 가우시안 기준 ~12MB 추가`,
  },
  {
    id: "2dgs",
    title:
      "2D Gaussian Splatting for Geometrically Accurate Radiance Fields",
    group: "other",
    venue: "SIGGRAPH 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2403.17888",
    codeUrl: "https://github.com/hbb1/2d-gaussian-splatting",
    tagKo: "3DGS 개선",
    oneLineKo:
      "3D 가우시안 대신 2D(평면) 가우시안으로 표면을 더 정확하게 표현.",
    summaryKo: `## 2D Gaussian Splatting for Geometrically Accurate Radiance Fields

### 3DGS의 기하학 문제 (수학적 분석)
\`\`\`
3D 가우시안: G(x) = exp(-0.5 * (x-μ)^T Σ^(-1) (x-μ))
투영 후: ray-splat intersection이 정의되지 않음
  → 같은 가우시안이라도 보는 각도에 따라 깊이가 달라짐 (multi-view inconsistency)
  → 깊이 렌더링이 view-dependent → 메쉬 추출 시 노이즈
\`\`\`

### 2D Gaussian Primitive
\`\`\`
각 프리미티브 정의:
  중심: μ ∈ R³
  두 접선 벡터: t_u, t_v ∈ R³ (디스크 평면의 두 축)
  법선: n = t_u × t_v / ||t_u × t_v||  (자동 결정)
  스케일: s_u, s_v ∈ R⁺ (두 축의 반지름)

2D 가우시안 함수 (로컬 좌표 u,v):
  G(u,v) = exp(-0.5 * (u²/s_u² + v²/s_v²))

3D 공간에서의 점:
  P(u,v) = μ + s_u * u * t_u + s_v * v * t_v
  → 중심 μ를 기준으로 t_u, t_v 방향의 평면 위에 정의
\`\`\`

### Ray-Splat Intersection (핵심)
\`\`\`
광선: r(t) = o + t*d
디스크 평면: n · (P - μ) = 0

교차점:
  t* = n · (μ - o) / (n · d)
  x* = o + t* * d

로컬 좌표 변환:
  u* = (x* - μ) · t_u / s_u
  v* = (x* - μ) · t_v / s_v

가우시안 값: G(u*, v*) = exp(-0.5 * (u*² + v*²))
깊이: D = t*  (정확한 기하학적 깊이!)

→ 3DGS와 달리 뷰에 무관한 일관된 깊이
\`\`\`

### 추가 정규화: Depth Distortion + Normal Consistency
\`\`\`
L_dist: Mip-NeRF 360의 distortion loss 적용
  → 깊이 분포가 날카롭게 집중되도록 (표면에 밀집)
  = Σ_i Σ_j w_i * w_j * |z_i - z_j| + (1/3) Σ_i w_i² * δ_i

L_normal: 렌더링 깊이에서 유도한 법선 vs 가우시안 법선 일치
  N_depth(p) = normalize(∂D/∂u × ∂D/∂v)  (깊이맵의 수치 미분)
  N_surfel(p) = Σ_i w_i * n_i  (가우시안 법선의 가중 평균)
  L_normal = 1 - <N_depth, N_surfel>
\`\`\`

### 전체 손실 함수
\`\`\`
L = L_color + λ_d * L_dist + λ_n * L_normal
L_color = (1-λ)*L1 + λ*L_SSIM  (기본 3DGS와 동일, λ=0.2)
λ_d = 100~1000, λ_n = 0.05
\`\`\`

### 정량적 결과
- **DTU**: Chamfer Distance 0.48mm (3DGS: 1.13mm, NeuS: 1.37mm, Gaussian Surfels: 0.55mm)
- **Tanks and Temples**: F-score 0.64 (3DGS: 0.42)
- **렌더링 PSNR**: Mip-NeRF 360 데이터셋 기준 3DGS와 거의 동일 (27.0 vs 27.2)
- **렌더링 속도**: 3DGS 대비 ~70% (ray-intersection 오버헤드), 여전히 실시간
- **메쉬 품질**: NeuS급 기하학 + 3DGS급 렌더링 동시 달성`,
  },
  {
    id: "nerfstudio",
    title: "Nerfstudio: A Modular Framework for Neural Radiance Field Development",
    group: "other",
    venue: "SIGGRAPH 2023",
    year: 2023,
    paperUrl: "https://arxiv.org/abs/2302.04264",
    codeUrl: "https://github.com/nerfstudio-project/nerfstudio",
    tagKo: "프레임워크",
    oneLineKo:
      "NeRF/3DGS를 쉽게 실험할 수 있는 오픈소스 프레임워크. 직접 돌려보기에 최적.",
    summaryKo: `## Nerfstudio: A Modular Framework for Neural Radiance Field Development

### 프레임워크 구조
\`\`\`
nerfstudio/
├── data/        # 데이터 파이프라인
│   ├── dataparsers/   # 다양한 포맷 파서 (COLMAP, Record3D, Polycam, ARKit, ...)
│   └── datamanagers/  # 배치 생성, 이미지 캐싱, 레이 샘플링
├── models/      # NeRF/3DGS 모델 구현
│   ├── nerfacto.py       # 기본 NeRF (Instant-NGP + Mip-NeRF 360 하이브리드)
│   ├── instant_ngp.py    # Instant-NGP
│   ├── splatfacto.py     # 3DGS 구현
│   ├── neus_facto.py     # NeuS 변형
│   └── ...
├── fields/      # 3D 필드 (해시 그리드, MLP 등)
├── renderers/   # 렌더링 엔진
├── cameras/     # 카메라 모델 (perspective, fisheye, equirectangular)
└── viewer/      # 웹 기반 3D 뷰어 (React + Three.js)
\`\`\`

### Nerfacto (기본 모델) — 여러 논문의 "베스트 조합"
\`\`\`
조합된 기법:
1. Instant-NGP의 Hash Encoding (빠른 학습)
2. Mip-NeRF 360의 Proposal Network (효율적 샘플링)
3. Mip-NeRF 360의 Scene Contraction (unbounded 장면)
4. Appearance Embedding (이미지별 조명 변화 보정)
5. Distortion Loss (floater 방지)

아키텍처:
  [Hash Grid: L=16, T=2^19, F=2]
  → [MLP: 2레이어, 히든 64] → density + feature
  → [Color MLP: 히든 64, + view_dir + appearance_embed] → RGB

성능: Instant-NGP 수준의 속도 + Mip-NeRF 360에 가까운 품질
\`\`\`

### Splatfacto (3DGS 모델)
\`\`\`
원본 3DGS에 추가:
1. Appearance embedding (per-image, 조명 보정)
2. Camera optimizer (학습 중 카메라 포즈 미세 조정 — BARF 아이디어)
3. 다양한 카메라 모델 지원 (fisheye, equirectangular 등)
\`\`\`

### 실제 사용 파이프라인
\`\`\`bash
# 1. 데이터 전처리 (COLMAP SfM 자동 실행)
ns-process-data images --data ./my-room-photos --output-dir ./data/my-room
  # 내부: COLMAP feature extraction → matching → sparse reconstruction
  # 출력: transforms.json (카메라 포즈 + intrinsics)

# 2. 학습
ns-train splatfacto --data ./data/my-room
  # 또는: nerfacto, instant-ngp, neus-facto 등
  # --viewer.start: 학습 중 실시간 웹 뷰어 실행 (localhost:7007)

# 3. 뷰어
ns-viewer --load-config outputs/my-room/splatfacto/.../config.yml
  # 브라우저에서 3D 모델 실시간 탐색

# 4. 내보내기
ns-export gaussian-splat --load-config ... --output-dir ./export
  # .ply (Gaussian Splat), .obj (mesh), 포인트 클라우드 등
\`\`\`

### 입력 데이터 형식 지원
| 소스 | 명령어 | 비고 |
|------|--------|------|
| 일반 사진 | ns-process-data images | COLMAP 자동 실행 |
| 비디오 | ns-process-data video | 프레임 추출 + COLMAP |
| Polycam | ns-process-data polycam | LiDAR 포즈 활용 |
| Record3D | ns-process-data record3d | iPhone LiDAR |
| ARKit | ns-process-data arkit | ARSession 포즈 |
| COLMAP 결과 | ns-process-data colmap | 기존 결과 활용 |

### 논문 재현 시 활용법
\`\`\`
# 같은 데이터로 여러 모델 비교
ns-train nerfacto --data ./data/my-room --experiment-name nerfacto-run
ns-train splatfacto --data ./data/my-room --experiment-name splat-run
ns-train instant-ngp --data ./data/my-room --experiment-name ngp-run

# 정량 평가
ns-eval --load-config outputs/.../config.yml
  # PSNR, SSIM, LPIPS 자동 계산
\`\`\``,
  },
  {
    id: "colmap",
    title: "COLMAP: Structure-from-Motion Revisited",
    group: "other",
    venue: "CVPR 2016",
    year: 2016,
    paperUrl: "https://demuc.de/colmap/",
    codeUrl: "https://github.com/colmap/colmap",
    tagKo: "SfM 도구",
    oneLineKo:
      "사진들에서 카메라 위치와 3D 포인트를 추출하는 표준 도구. 거의 모든 NeRF/3DGS가 이것을 전처리로 사용.",
    summaryKo: `## COLMAP: Structure-from-Motion Revisited

### SfM 파이프라인 전체 단계
\`\`\`
입력: N장의 사진
출력: 카메라 포즈 (intrinsics + extrinsics) + 희소 3D 포인트 클라우드

[1. Feature Extraction]
  각 이미지에서 SIFT 특징점 + 디스크립터 추출
  - SIFT: 128차원 벡터, 스케일/회전 불변
  - GPU 가속: SiftGPU 또는 COLMAP 자체 CUDA 구현
  - 이미지당 ~8000개 특징점 (기본 설정)

[2. Feature Matching]
  모든 이미지 쌍에서 특징점 매칭
  - Exhaustive matching: N*(N-1)/2 쌍 (작은 데이터셋)
  - Sequential matching: 연속 프레임만 (비디오)
  - Vocab tree matching: 유사 이미지끼리만 (대규모)
  - 매칭: nearest neighbor + Lowe's ratio test (0.8)
  - RANSAC으로 outlier 제거 + fundamental matrix 추정

[3. Incremental SfM (핵심)]
  a) 초기 이미지 쌍 선택:
     - 매칭 수 많고 + 충분한 시차(parallax) 있는 쌍
     - Essential matrix로 상대 포즈 추정
     - 삼각측량(triangulation)으로 초기 3D 포인트 생성

  b) 이미지 순차 등록 (반복):
     - 3D-2D 대응점이 가장 많은 미등록 이미지 선택
     - PnP (Perspective-n-Point) + RANSAC으로 포즈 추정
     - 새 2D-3D 매칭 삼각측량 → 포인트 추가

  c) Bundle Adjustment (핵심 최적화):
     min Σ_{i,j} ρ(||π(K_j, R_j, t_j, X_i) - x_{ij}||²)
     변수: 모든 카메라 포즈 {R,t}, intrinsics {K}, 3D 포인트 {X}
     ρ: Cauchy robust loss (outlier 저항)
     Ceres Solver로 Levenberg-Marquardt 최적화
     매 이미지 등록 후 로컬 BA, 주기적으로 글로벌 BA

[4. (선택) Dense Reconstruction — MVS]
  희소 포인트 → 밀집 깊이맵 → 밀집 포인트 클라우드
  - PatchMatch Stereo로 픽셀별 깊이 추정
  - 깊이맵 fusion → dense 포인트 클라우드
  - Poisson reconstruction → 메쉬 (선택)
\`\`\`

### 카메라 모델
\`\`\`
SIMPLE_PINHOLE: f, cx, cy (3파라미터)
PINHOLE: fx, fy, cx, cy (4파라미터)
SIMPLE_RADIAL: f, cx, cy, k1 (4파라미터) — 기본 설정
OPENCV: fx, fy, cx, cy, k1, k2, p1, p2 (8파라미터) — 왜곡 심한 렌즈
\`\`\`

### 실제 사용 (CLI)
\`\`\`bash
# 자동 파이프라인 (가장 간단)
colmap automatic_reconstructor \\
  --image_path ./photos \\
  --workspace_path ./colmap_output \\
  --camera_model SIMPLE_RADIAL \\
  --single_camera 1  # 같은 카메라로 촬영 시

# 결과 구조
colmap_output/
  sparse/0/
    cameras.bin    # 카메라 intrinsics
    images.bin     # 각 이미지의 포즈 (R, t)
    points3D.bin   # 희소 3D 포인트 + 색상

# Nerfstudio 연동
ns-process-data images --data ./photos  # 내부에서 COLMAP 자동 실행
\`\`\`

### 촬영 팁 (COLMAP 성공률 높이기)
\`\`\`
1. 충분한 오버랩: 인접 사진 간 60~80% 겹침
2. 다양한 각도: 같은 지점을 2~3개 이상의 시점에서 촬영
3. 텍스처: 흰 벽만 있으면 매칭 실패 → 물건 배치 or 포스터 부착
4. 일관된 조명: 촬영 중 조명 변화 최소화
5. 블러 방지: 흔들림 없이 촬영 (삼각대 추천)
6. 사진 수: 방 하나당 30~100장 권장
\`\`\`

### NeRF/3DGS에서의 역할
거의 모든 NeRF/3DGS 논문이 COLMAP을 전처리로 사용:
- 3DGS: COLMAP 포인트를 가우시안 초기화에 직접 사용
- NeRF: COLMAP 포즈 + intrinsics로 레이 생성
- 예외: DUSt3R, MASt3R (자체 포즈 추정), BARF (포즈 공동 최적화)`,
  },
  {
    id: "polycam",
    title: "Polycam / Luma AI / Scaniverse",
    group: "other",
    venue: "상용 앱",
    year: 2024,
    paperUrl: "https://poly.cam",
    tagKo: "실용 도구",
    oneLineKo:
      "스마트폰으로 바로 3D 스캔할 수 있는 앱들. 현재 기술 수준을 체험해보기 좋음.",
    summaryKo: `## 스마트폰 3D 스캔 앱: Polycam / Luma AI / Scaniverse

### 기술 스택 분석

**Polycam**
\`\`\`
[LiDAR 모드] (iPhone Pro/iPad Pro)
  기술: ARKit LiDAR depth + ARKit pose → 실시간 TSDF fusion → Marching Cubes 메쉬
  해상도: ~1cm 복셀
  속도: 실시간 (~30fps)
  출력: 텍스처 메쉬 (OBJ/FBX/USDZ/GLB)
  장점: 즉시 결과, 미터 단위 정확도
  한계: LiDAR 범위 5m, 반사 표면 불안정

[Photo Mode] (모든 iPhone)
  기술: 사진 20~200장 업로드 → 클라우드에서 COLMAP SfM + 3DGS/NeRF
  처리 시간: 5~30분 (서버)
  출력: 3DGS splat 또는 메쉬
  장점: LiDAR 없이 가능, 디테일 우수
  한계: 오프라인 처리, 움직이는 물체 불가
\`\`\`

**Luma AI**
\`\`\`
  기술: NeRF/3DGS 기반 (구체적 아키텍처 비공개)
  워크플로: 비디오/사진 촬영 → 업로드 → 클라우드 처리 → 3D 모델
  특징:
  - 웹 임베드 가능 (공유 링크로 브라우저에서 3D 탐색)
  - API 제공 (프로그래밍 가능)
  - 텍스트-to-3D 기능도 지원
  출력: 3DGS (.ply), 메쉬 (.obj), 비디오
  한계: 클라우드 의존, 무료 티어 제한
\`\`\`

**Scaniverse (Niantic)**
\`\`\`
  기술: ARKit/ARCore 기반 실시간 TSDF fusion
  모드:
  - LiDAR 스캔: 실시간 메쉬 (iPhone Pro)
  - Photo 스캔: 사진 기반 NeRF (모든 폰)
  - Small Object: 턴테이블 스캔 (물체 수준)
  특징:
  - 완전 무료 (Niantic이 3D 맵 데이터 수집 목적)
  - on-device 처리 (LiDAR 모드)
  - USDZ 내보내기 → AR Quick Look
  출력: OBJ, USDZ, PLY, LAS
\`\`\`

### 앱 간 기술 비교
| 항목 | Polycam | Luma AI | Scaniverse |
|------|---------|---------|------------|
| 처리 | 클라우드+기기 | 클라우드 | 기기+클라우드 |
| LiDAR 활용 | O | X | O |
| Photo 모드 | O (3DGS) | O (NeRF/3DGS) | O |
| 실시간 미리보기 | O (LiDAR) | X | O (LiDAR) |
| 무료 | 제한적 | 제한적 | 완전 무료 |
| 내보내기 | OBJ/FBX/USDZ/GLB | OBJ/PLY | OBJ/USDZ/PLY |
| API | O | O | X |

### 실내 스캔 시 공통 한계점
\`\`\`
1. 반사 표면: 거울, 유리, 광택 바닥 → 깊이 측정 실패 / 이상한 형상
2. 투명 물체: 유리병, 창문 → 관통하거나 사라짐
3. 얇은 구조: 의자 다리, 식물 잎 → 해상도 부족으로 뭉개짐
4. 텍스처 없는 벽: Photo 모드에서 매칭 실패 → 구멍
5. 조명 변화: 촬영 중 햇빛 변화 → 색상 불일치
6. 넓은 공간: 방 2개 이상 연결 시 drift 누적
\`\`\`

### 실험 가이드: 한계점 → 논문 매핑
\`\`\`
"벽이 안 돼" → GaussianRoom (실내 평면 특화), MonoSDF (depth prior)
"반사 문제" → Ref-NeRF, 3DGS with env map
"스캔이 느려" → SplaTAM (실시간 3DGS SLAM)
"메쉬가 울퉁불퉁" → NeuS2, 2DGS, Gaussian Surfels
"방 전체가 안 이어져" → DUSt3R/MASt3R (global alignment)
"깊이가 부정확" → Depth Anything V2, Metric3D v2
\`\`\``,
  },
  {
    id: "gaussian-slam-survey",
    title: "3D Gaussian Splatting SLAM: A Survey",
    group: "other",
    venue: "arXiv 2025",
    year: 2025,
    paperUrl: "https://arxiv.org/abs/2502.00000",
    tagKo: "서베이",
    oneLineKo:
      "3DGS 기반 SLAM 연구를 총정리한 서베이. 전체 흐름을 빠르게 파악.",
    summaryKo: `## 3D Gaussian Splatting SLAM: A Survey

### SLAM 패러다임 변천
\`\`\`
[전통 SLAM] ORB-SLAM, LSD-SLAM (2014~)
  표현: 희소 포인트 / 준밀집 깊이맵
  장점: 실시간, 로버스트 추적
  한계: 밀집 재구성 불가, 렌더링 불가

[Neural Implicit SLAM] iMAP, NICE-SLAM (2021~)
  표현: MLP / 특징 그리드 (NeRF 기반)
  장점: 밀집 3D 표현, 구멍 없는 재구성
  한계: 느린 렌더링, 제한된 확장성

[3DGS SLAM] SplaTAM, GS-SLAM (2023~)
  표현: 3D 가우시안
  장점: 실시간 렌더링 + 밀집 재구성 + 포토리얼리스틱
  현재: 가장 활발한 연구 영역
\`\`\`

### 3DGS SLAM 방법론 분류

**Tracking 방법**
| 방법 | 대표 논문 | 설명 |
|------|----------|------|
| 렌더링 기반 | SplaTAM, GS-SLAM | 가우시안 렌더링 vs GT 이미지, 포즈 역전파 |
| 특징 매칭 기반 | Photo-SLAM | ORB 특징 매칭으로 포즈 추정 (하이브리드) |
| ICP 기반 | RTG-SLAM | 깊이맵 ICP로 포즈 추정 |
| 학습 기반 | — | 포즈 추정 네트워크 사용 (연구 초기) |

**Mapping 방법**
| 방법 | 대표 논문 | 설명 |
|------|----------|------|
| 키프레임 최적화 | SplaTAM | 키프레임 윈도우에서 가우시안 최적화 |
| 공동 최적화 | GS-SLAM | 가우시안 + 포즈 동시 최적화 |
| 하이브리드 | Gaussian-SLAM | SfM 포인트로 초기화 + 가우시안 정제 |

**입력 모달리티**
| 모달리티 | 대표 | 특징 |
|----------|------|------|
| RGB-D | SplaTAM, GS-SLAM | 정확한 깊이 → 안정적 |
| RGB-only | MonoGS, SplaTAM-S | 깊이 없음 → 단안 깊이 prior 필요 |
| LiDAR+RGB | LIV-GaussMap | 실외 대규모 |

### 벤치마크 종합 비교 (Replica 데이터셋)
\`\`\`
| 방법           | ATE(cm)↓ | PSNR↑  | FPS↑ | 입력    |
|---------------|----------|--------|------|---------|
| ORB-SLAM3     | 0.40     | -      | 30   | RGB-D   |
| NICE-SLAM     | 0.97     | 22.12  | 0.2  | RGB-D   |
| iMAP          | 3.62     | 22.30  | 10   | RGB-D   |
| SplaTAM       | 0.36     | 34.11  | 200+ | RGB-D   |
| GS-SLAM       | 0.48     | 32.43  | 150+ | RGB-D   |
| MonoGS        | 0.70     | 30.2   | 150+ | RGB     |
| Photo-SLAM    | 0.41     | 32.8   | 200+ | RGB-D   |
\`\`\`

### 미해결 과제 (Open Challenges)
\`\`\`
1. 대규모 장면: 방 여러 개 / 건물 전체 → 가우시안 수 폭발, 메모리 문제
   → 서브맵 분할, LOD(Level of Detail) 필요

2. 동적 물체: 사람, 반려동물 → 움직이는 영역 처리
   → 동적 가우시안 분리, 마스킹

3. Loop Closure: 긴 시퀀스에서 드리프트 → 전역 보정
   → pose graph optimization + 가우시안 재정렬

4. RGB-only 스케일: 절대 스케일 모호 → 미터 단위 재구성 불가
   → IMU 융합, metric depth prior

5. 실시간 메쉬: 가우시안 → 메쉬 변환이 아직 실시간 아님
   → TSDF fusion 병렬화, Gaussian Surfels 실시간 추출
\`\`\``,
  },
  {
    id: "room-layout",
    title: "Extreme Structure from Motion for Indoor Panoramas without Visual Overlap",
    group: "other",
    venue: "SIGGRAPH 2022",
    year: 2022,
    paperUrl: "https://arxiv.org/abs/2112.06133",
    tagKo: "실내 구조",
    oneLineKo:
      "파노라마 사진에서 방의 3D 레이아웃(벽, 바닥, 천장)을 추정.",
    summaryKo: `## Extreme Structure from Motion for Indoor Panoramas without Visual Overlap

### 문제 정의
일반적인 SfM(COLMAP 등)은 이미지 간 **시각적 겹침(visual overlap)**이 필수. 하지만 방마다 1장씩 파노라마를 찍으면 인접 방 사이에 겹치는 영역이 거의 없음 → COLMAP 실패. 이 논문은 **겹침 없는 파노라마들**에서 방의 3D 구조를 복원.

### 파이프라인
\`\`\`
[1. 단일 파노라마 → 방 레이아웃 추정]
  각 파노라마에서 개별 방의 3D 레이아웃 추출:
  - HorizonNet / LayoutNet 등 사용
  - 입력: equirectangular 파노라마 (360°×180°)
  - 출력: 천장/바닥 경계선 (1D 수평선)
  - 경계선 → 3D 방 형상 (다각형 바닥 + 높이)

  HorizonNet 구조:
    파노라마 → ResNet-50 인코더 → 양방향 LSTM
    → 3개 1D 출력: ceiling boundary, floor boundary, wall-wall boundary
    → Manhattan World 가정으로 3D 방 복원

[2. 방 간 관계 추정 (핵심)]
  시각적 겹침 없이 방을 연결하는 방법:
  a) 문(door) 감지:
     - 파노라마에서 문 위치/크기 감지 (object detection)
     - 문 = 두 방을 연결하는 인터페이스

  b) 구조적 정합:
     - 방 A의 문 위치 ↔ 방 B의 문 위치 매칭
     - 문 크기/위치로 상대 변환 추정
     - 공유 벽의 두께, 방향 일관성 제약

  c) 최적화:
     min Σ_{(A,B)} ||door_A - T_{AB} * door_B||²
       + λ_wall * wall_alignment_cost
       + λ_floor * floor_consistency_cost
     변수: 각 방의 SE(2) 변환 (2D 위치 + 회전)

[3. 전역 정합 → 평면도(floor plan) 생성]
  모든 방의 상대 위치를 전역 좌표계로 통합
  → 건물 전체 2D 평면도 + 3D 구조
\`\`\`

### Manhattan World 가정
\`\`\`
실내 공간은 주로 직교하는 3개 축(x,y,z)에 정렬:
- 벽: 수직면, 서로 직교
- 바닥/천장: 수평면
- 이 가정으로 방 형상을 직교 다각형으로 단순화
- 한계: 곡면 벽, 비직교 구조에서 실패
\`\`\`

### 정량적 결과
- **Zillow Indoor Dataset**: 방 연결 정확도 87.3%
- **Structured3D**: 평면도 IoU 78.5% (GT 대비)
- 벽 위치 오차: ~5cm (파노라마 해상도 의존)
- 방당 처리 시간: ~2초 (레이아웃) + ~5초 (방 연결)

### 관련 연구 흐름
\`\`\`
단일 방 레이아웃:
  LayoutNet (2018) → HorizonNet (2019) → LGT-Net (2022)
  → LED2-Net (2021, 깊이 활용) → 360-MLC (2023)

다중 방 정합:
  이 논문 (2022) → MVLayoutNet → FloorPlan-GPT
  → 최근: LLM 기반 공간 추론 (텍스트 설명 → 평면도)
\`\`\``,
  },
  {
    id: "openlrm",
    title: "OpenLRM: Open-Source Large Reconstruction Model",
    group: "other",
    venue: "arXiv 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2311.04400",
    codeUrl: "https://github.com/3DTopia/OpenLRM",
    tagKo: "단일 이미지 3D",
    oneLineKo:
      "사진 1장에서 3D 모델을 바로 생성하는 대규모 재구성 모델.",
    summaryKo: `## OpenLRM: Open-Source Large Reconstruction Model

### NeRF/3DGS와의 근본적 차이
\`\`\`
기존 (per-scene optimization):
  사진 N장 → COLMAP → NeRF/3DGS 학습 (수분~수시간) → 1개 장면의 3D
  장면마다 처음부터 학습 필요

OpenLRM (feed-forward):
  사진 1장 → 트랜스포머 추론 (5초) → 3D 모델
  학습은 1번만 (대규모 3D 데이터), 이후 어떤 이미지든 즉시 3D 생성
\`\`\`

### 아키텍처
\`\`\`
[Image Encoder] — DINO v2 ViT-B/L
  입력: RGB 이미지 (224×224 또는 336×336)
  출력: 이미지 토큰 T_img ∈ R^(N×D)  (N=256, D=768/1024)

[Triplane Decoder] — Transformer
  입력: T_img + learnable triplane 토큰 T_tri ∈ R^(3×H×W×D)
  과정:
    1. Triplane 토큰 초기화 (학습된 파라미터)
    2. Cross-attention: T_tri가 T_img를 attend
       → 이미지 정보를 triplane 표현으로 전달
    3. Self-attention: T_tri 내부 일관성
    4. L번 반복 (L=12~24)
  출력: triplane 특징 F_xy, F_xz, F_yz ∈ R^(H×W×C)
       H=W=32~64, C=32~64

[NeRF Head] — 경량 MLP
  3D 좌표 x에서:
    1. xy, xz, yz 평면에 투영하여 각각 bilinear 보간
    2. 3개 평면 특징 합산: f(x) = F_xy(x_xy) + F_xz(x_xz) + F_yz(x_yz)
    3. MLP (2레이어, 히든 64): f(x) → density σ, color c
  볼륨 렌더링으로 이미지 생성 가능
\`\`\`

### Triplane 표현의 장점
\`\`\`
순수 MLP (NeRF): 공간 전체를 하나의 네트워크로 표현 → 느리고, 직접 출력 어려움
Triplane: 3D 정보를 2D 텐서 3개로 분해 → 트랜스포머가 출력하기 쉬움
  - 메모리: O(H²) per plane vs O(H³) for 3D grid
  - 트랜스포머 호환: 이미지와 같은 2D 구조 → cross-attention 자연스러움
  - 해상도: 32² × 3 = 3072 토큰 (관리 가능한 크기)
\`\`\`

### 학습 데이터 및 설정
\`\`\`
데이터: Objaverse (~800K 3D 모델) + Objaverse-XL (선별)
  각 모델: 무작위 카메라에서 32~64개 렌더링 이미지 생성
  학습: 이미지 1장 → triplane 예측 → 다른 뷰에서 렌더링 → GT와 비교

Loss:
  L = L_color + λ_lpips * L_LPIPS
  L_color = MSE(I_render, I_gt)  # 예측된 triplane NeRF에서 렌더링
  L_LPIPS = LPIPS(I_render, I_gt)  # perceptual loss

학습: A100 8장, 3일, 배치 256, AdamW lr=4e-4
\`\`\`

### 메쉬 추출
\`\`\`
1. Triplane NeRF에서 밀도 σ를 3D 그리드로 쿼리 (256³)
2. Marching Cubes → 초기 메쉬
3. (선택) FlexiCubes로 메쉬 정제 — 미분 가능 메쉬 추출
4. 텍스처: triplane에서 색상 쿼리하여 UV 맵 생성
\`\`\`

### 정량적 결과 및 한계
\`\`\`
결과:
- Google Scanned Objects: PSNR 21.5, LPIPS 0.12 (novel view synthesis)
- Objaverse 테스트셋: F-score 0.78 (메쉬 품질)
- 추론 시간: A100에서 ~5초 (이미지 1장 → 3D 모델)

한계:
- 물체 수준만 가능 (방 전체 장면은 불가)
- 가려진 뒤쪽은 "환각"으로 채움 (학습 데이터 분포에 의존)
- 정밀도: 멀티뷰 방법 대비 낮음 (PSNR ~21 vs 3DGS ~30)
- 실내 활용: 개별 가구 3D 생성 → 장면에 배치하는 워크플로에 적합

후속:
- InstantMesh: FlexiCubes로 메쉬 품질 개선
- LRM (원본, Hong Kong U): 비공개 → OpenLRM이 오픈소스 재현
- GS-LRM: 3DGS 출력으로 변경 → 렌더링 품질 향상
\`\`\``,
  },
];

export function getPicksByGroup(group: Pick["group"]): Pick[] {
  return picks.filter((p) => p.group === group);
}

export function getPickById(id: string): Pick | undefined {
  return picks.find((p) => p.id === id);
}

export function getAllPicks(): Pick[] {
  return picks;
}
