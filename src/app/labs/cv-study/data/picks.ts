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

### 핵심 아이디어

기존 3D 복원 파이프라인은 특징점 매칭 → 삼각측량 → 번들 조정 등 여러 단계를 거쳐야 했다. DUSt3R는 이 과정을 **하나의 신경망**으로 대체한다. 이미지 쌍을 넣으면 **3D 포인트맵**(각 픽셀의 3차원 좌표)이 바로 나온다.

### 구조

- **인코더**: CroCo(크로스뷰 완성 과제로 사전학습된 Vision Transformer)를 백본으로 사용하여 두 이미지의 특징을 추출한다
- **디코더 2개**: 각각 한 이미지를 담당하며, **크로스 어텐션**(상대 이미지 정보를 참조하는 메커니즘)으로 서로 소통한다. 두 디코더가 **같은 좌표계** 안에서 3D 좌표를 예측하는 것이 핵심이다
- **신뢰도 맵**: 각 포인트가 얼마나 믿을 만한지 가중치를 함께 출력하여, 부정확한 영역을 자연스럽게 걸러낸다

### Global Alignment

이미지 쌍 단위 예측을 **여러 쌍에 걸쳐 통합**하는 후처리 단계. 겹치는 영역의 포인트를 정합하여 전체 장면을 하나의 좌표계로 합친다.

### 주요 성과

- ScanNet 포즈 추정에서 COLMAP(전통적 SfM 파이프라인의 표준) 대비 우수한 정확도 달성
- 이미지 쌍당 약 0.1초로 빠른 추론 속도

### 실용적 의미

실내 디지털 트윈 구축 시 스마트폰으로 찍은 사진 몇 장만으로 3D 구조를 빠르게 복원할 수 있는 가능성을 열어준다. 특징점 매칭 실패가 잦은 텍스처 부족 환경(흰 벽, 유리 등)에서도 학습 기반으로 3D를 예측하므로 실내 환경에 특히 유리하다.`,
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
    summaryKo: `## Depth Anything

### 핵심 아이디어

단안 깊이 추정(한 장의 사진에서 각 픽셀의 거리를 예측하는 과제)에서 **레이블 없는 대량 데이터를 활용하는 방법**을 제시한다. 핵심 통찰은 "강한 교란을 견디며 학습한 학생 모델이 교사보다 강건해진다"는 것이다.

### 구조

- **인코더**: DINOv2 기반 Vision Transformer — 자기지도학습으로 사전학습되어 범용 시각 특징을 잘 잡아낸다
- **디코더**: DPT(Dense Prediction Transformer) 헤드 — 다양한 해상도의 특징을 결합하여 픽셀 단위 깊이맵을 출력한다

### 학습 전략: Teacher-Student

- **교사 모델**: 약 150만 장의 레이블 데이터로 학습
- **교사가 6,200만 장의 비레이블 이미지에 의사 레이블**(pseudo-label)을 생성
- **학생 모델**: 이 의사 레이블 데이터에 **강한 augmentation**(색 변환, 잘라내기 등 공격적 데이터 변형)을 적용하며 학습
- 결과적으로 학생이 교사보다 더 다양한 환경에 강건해짐

### V2 업그레이드

- 교사를 **합성 데이터만**으로 학습시켜 실제-합성 도메인 갭 문제를 줄임
- **미터 단위 절대 깊이** 추정도 지원

### 실용적 의미

실내 디지털 트윈에서 깊이 센서 없이 일반 카메라 한 대로 깊이 정보를 얻을 수 있다. V2의 미터 단위 깊이 지원은 실제 스케일이 필요한 공간 측정에 직접 활용 가능하다.`,
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
    summaryKo: `## SplaTAM: Splat Track & Map

### 핵심 아이디어

**3D Gaussian Splatting**(3DGS — 3차원 공간에 가우시안 타원체를 뿌려 장면을 표현하는 방식)을 **유일한 장면 표현**으로 사용하는 최초의 밀집 SLAM(동시 위치 추정 및 지도 생성) 시스템이다.

### 파이프라인

RGB-D(컬러+깊이) 입력으로 세 단계를 반복한다:

- **Track**: 기존 가우시안을 렌더링한 결과와 현재 프레임을 비교하는 **실루엣 손실**로 카메라 위치를 최적화
- **Map (추가)**: 기존 가우시안이 커버하지 못하는 새 영역에 가우시안을 추가
- **Map (정제)**: 추가된 가우시안을 포함해 전체를 함께 최적화하여 품질 향상

### 왜 3DGS인가

- NeRF 대비 렌더링이 빠르고, 명시적 포인트 단위 조작이 가능하다
- 어느 영역이 이미 관측되었는지를 가우시안의 실루엣으로 바로 판단할 수 있어, 새 영역 탐지가 직관적이다

### 주요 성과

- Replica, TUM-RGBD 등 실내 벤치마크에서 기존 NeRF 기반 SLAM과 경쟁하며, 실시간에 가까운 속도 달성

### 실용적 의미

실내 디지털 트윈 구축에서 깊이 카메라를 들고 걸어다니면 실시간으로 3D 가우시안 맵이 생성된다. 완성된 맵은 바로 포토리얼리스틱 렌더링에 사용 가능하여, 스캔과 시각화를 한 번에 해결한다.`,
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
    summaryKo: `## GS-SLAM

### 핵심 아이디어

3D Gaussian Splatting 기반 SLAM으로, **적응적 가우시안 확장 전략**을 통해 장면 복잡도에 맞게 가우시안을 동적으로 늘려가는 것이 특징이다.

### 구조와 전략

- **RGB-D 입력** 기반
- **트래킹**: 미분 가능 렌더링(렌더링 과정에 역전파가 가능한 구조) 손실로 카메라 자세를 최적화
- **매핑**: 키프레임 기반으로, **슬라이딩 윈도우** 안의 프레임들만 동시에 최적화하여 계산량을 조절
- **적응적 확장**: 렌더링 오차가 큰 영역에 가우시안을 집중 배치하고, 불필요한 곳은 가지치기

### SplaTAM과의 비교

같은 3DGS-SLAM 계열이지만 접근이 다르다:

- SplaTAM은 실루엣 기반 탐지 + 전체 최적화
- GS-SLAM은 키프레임 + 슬라이딩 윈도우로 효율 중심 설계
- GS-SLAM이 약 5fps의 실시간 성능을 명시적으로 달성

### 주요 성과

- Replica, ScanNet에서 경쟁력 있는 복원 품질을 실시간 수준으로 달성

### 실용적 의미

실내 디지털 트윈에서 넓은 공간을 스캔할 때, 적응적 확장이 복잡한 가구 영역에는 가우시안을 많이, 단순한 벽면에는 적게 배치하여 메모리 효율과 품질을 동시에 잡는다.`,
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
    summaryKo: `## Metric3D v2

### 핵심 아이디어

단안 깊이 추정에서 한 걸음 더 나아가 **미터 단위의 절대 깊이**와 **표면 법선**(surface normal — 표면이 향하는 방향)을 동시에 예측한다. 핵심 기여는 **정준 카메라 변환**(canonical camera transform)이라는 기법이다.

### 왜 정준 카메라 변환이 필요한가

서로 다른 카메라(스마트폰, 웹캠, 라이다 등)로 찍은 데이터를 합쳐 학습하면, 카메라마다 **초점 거리와 화각이 달라** 같은 물체도 다른 깊이로 보인다. 정준 카메라 변환은 모든 이미지를 가상의 표준 카메라로 촬영한 것처럼 정규화하여, **스케일 모호성 없이** 다양한 데이터셋을 통합 학습할 수 있게 한다.

### 구조

- **백본**: DINO 사전학습 Vision Transformer
- **출력**: 깊이맵(미터 단위) + 표면 법선맵을 함께 예측하며, 두 출력이 서로의 학습을 보강하는 구조

### 주요 성과

- NYU(실내), KITTI(실외) 벤치마크에서 미터 단위 깊이 추정 최고 성능

### 실용적 의미

실내 디지털 트윈에 가장 직접적으로 유용하다. 사진 한 장에서 실제 미터 단위 깊이를 얻을 수 있으므로, 방의 실제 크기 측정, 가구 배치 시뮬레이션 등에 바로 활용 가능하다. 표면 법선 정보는 평면 검출(바닥, 벽, 천장 구분)에도 핵심적이다.`,
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
    summaryKo: `## Photo-SLAM

### 핵심 아이디어

검증된 전통 SLAM인 **ORB-SLAM3의 트래킹 안정성**과 **3D Gaussian Splatting의 포토리얼리스틱 렌더링**을 결합한다. 추가로 메모리 효율을 높이는 **Hyper Primitives**를 도입한다.

### 구조

- **트래킹**: ORB-SLAM3(특징점 기반 전통 SLAM) 그대로 사용 — 오랜 검증을 거친 안정적 위치 추정
- **매핑**: 3D Gaussian Splatting으로 장면을 표현하되, 각 가우시안에 **암묵적 특징 벡터**(implicit feature)를 저장하고 작은 MLP(다층 퍼셉트론)로 디코딩하는 **Hyper Primitives** 방식을 사용
- **가우시안 피라미드**: 멀리 있는 가우시안은 저해상도로, 가까운 것은 고해상도로 렌더링하여 다중 스케일 처리

### Hyper Primitives의 이점

가우시안마다 색상, 투명도 등을 직접 저장하는 대신, 압축된 특징 벡터를 작은 네트워크로 복원하므로 **메모리 사용량이 크게 감소**한다.

### 주요 성과

- 단안/스테레오/RGB-D 모든 입력 타입 지원
- 실시간 SLAM과 포토리얼리스틱 렌더링을 동시에 달성

### 실용적 의미

실내 디지털 트윈 구축 시, ORB-SLAM3의 안정적 트래킹 덕분에 실패 없이 넓은 공간을 스캔할 수 있고, Hyper Primitives 덕분에 큰 공간도 메모리 부담 없이 고품질 3D로 저장할 수 있다.`,
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
    summaryKo: `## MonoGS: Gaussian Splatting SLAM (단안 입력)

### 핵심 아이디어

깊이 센서 없이 **일반 카메라 한 대**만으로 3D Gaussian Splatting 기반 SLAM을 수행한다. 대부분의 3DGS-SLAM이 RGB-D 입력을 요구하는 것과 대비된다.

### 깊이 센서 없이 어떻게?

- **단안 깊이 추정기**로 초기 깊이를 추정하여 가우시안을 초기화
- 이후 **미분 가능 렌더링**을 통해 카메라 자세와 가우시안 파라미터를 **공동 최적화**(joint optimization)
- 렌더링 결과와 실제 이미지의 차이를 줄이면서 깊이도 함께 정교화

### 안정화 기법

- **등방 정규화**(isotropic regularization): 가우시안이 극단적으로 길쭉하게 변형되는 것을 방지하여 학습 안정성 확보

### 주요 성과

- 깊이 센서를 사용하는 RGB-D 방식들과 비교해도 **경쟁력 있는 트래킹 및 복원 품질** 달성

### 실용적 의미

실내 디지털 트윈 구축의 진입 장벽을 크게 낮춘다. 별도 깊이 카메라 없이 스마트폰 카메라만으로 3D 스캔이 가능해지므로, 누구나 자신의 공간을 디지털 트윈으로 만들 수 있는 가능성을 보여준다.`,
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
    summaryKo: `## ScanNet: Indoor RGB-D Dataset

### 핵심 아이디어

실내 3D 이해의 **사실상 표준 벤치마크**가 된 대규모 데이터셋이다. 2017년 공개 이후 거의 모든 실내 3D 논문이 이 데이터셋에서 성능을 평가한다.

### 데이터 구성

- **1,513개 실내 장면**의 RGB-D 비디오
- 각 장면마다 **카메라 자세**, **표면 메시 복원**, **시맨틱 어노테이션**(객체별 의미 라벨)이 포함
- 일반 소비자용 깊이 센서로 촬영하여 현실적인 노이즈 포함

### 벤치마크로서의 역할

- **3D 시맨틱 분할**: 포인트클라우드에서 각 점이 어떤 물체인지 분류
- **3D 객체 탐지**: 3D 공간에서 물체의 바운딩 박스 예측
- **장면 복원 품질**: 메시 복원의 정확도 평가
- 이 스터디에서 다루는 DUSt3R, GS-SLAM 등 많은 논문이 ScanNet에서 평가

### 한계와 후속

- 해상도와 센서 품질이 현재 기준으로는 낮은 편
- ScanNet++ 등 후속 데이터셋이 더 높은 품질로 업데이트

### 실용적 의미

실내 디지털 트윈 연구의 **공통 언어** 역할을 한다. 새로운 방법의 성능을 이 데이터셋 기준으로 비교할 수 있어, 기술 선택 시 객관적 판단 근거가 된다.`,
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
    summaryKo: `## BundleSDF

### 핵심 아이디어

RGB-D 영상에서 **미지의 물체**(사전 3D 모델 없이)를 추적하고 정밀한 **메시를 복원**하는 시스템이다. 전통적 최적화와 신경망 기반 암묵적 표면 학습을 결합한다.

### 구조

- **포즈 그래프 최적화**(pose graph optimization): 프레임 간 물체의 상대적 위치 관계를 그래프로 구성하고, 전체적으로 일관된 자세를 추정하는 전통적 방법
- **Neural SDF**(신경 부호 거리 함수): 물체 표면을 암묵적 함수로 학습 — 공간의 각 점이 표면에서 얼마나 떨어져 있는지를 신경망이 예측
- **번들 조정**: SDF 렌더링 결과와 실제 관측 사이의 차이를 줄이며 자세와 형상을 동시에 정제

### 어려운 물체도 처리

- **텍스처 없는 물체**: 특징점 매칭이 불가능한 단색 물체도 SDF 기반 정합으로 추적
- **대칭 물체**: 어느 방향에서 봐도 비슷해 보이는 물체(컵, 병 등)의 자세도 안정적으로 추정

### 실용적 의미

실내 디지털 트윈에서 방 전체뿐 아니라 **개별 가구나 소품의 정밀 3D 모델**을 얻을 때 유용하다. 예를 들어 책상 위 물건들을 한 바퀴 찍어 각각의 메시를 추출한 뒤, 디지털 트윈 공간에 배치하는 워크플로우에 활용할 수 있다.`,
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
    summaryKo: `## pixelSplat

### 핵심 아이디어

이미지 **단 2장**을 넣으면 **한 번의 순전파**로 3D Gaussian Splatting 장면을 생성하는 **피드포워드 모델**이다. 장면별 최적화가 필요 없다는 점이 기존 3DGS와의 결정적 차이다.

### 핵심 구조: Epipolar Transformer

- **에피폴라 기하**(epipolar geometry): 한 이미지의 한 점이 다른 이미지에서 어디에 대응될 수 있는지를 직선(에피폴라 라인)으로 제한하는 기하학적 원리
- 이 에피폴라 라인을 따라 가우시안 후보를 샘플링하고, 트랜스포머가 최적의 3D 위치와 속성을 결정
- 기하학적 사전지식을 네트워크 구조에 직접 녹인 설계

### 학습과 추론

- RealEstate10K, ACID 등 실내/실외 데이터셋으로 학습
- 추론 시 **장면별 최적화 없이 즉시 결과** 출력 — 기존 3DGS가 장면당 수십 분 최적화가 필요한 것과 대비

### 실용적 의미

실내 디지털 트윈의 **빠른 프리뷰** 용도로 유용하다. 방에 들어서서 사진 2장만 찍으면 즉시 대략적인 3D 뷰를 생성할 수 있어, 본격적 스캔 전 공간 파악이나 부동산 프리뷰 등에 활용 가능하다.`,
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
    summaryKo: `## NeuS2

### 핵심 아이디어

**Neural SDF**(신경 부호 거리 함수) 기반 표면 복원을 **극적으로 빠르게** 만든 논문이다. 원래 NeuS가 수 시간 걸리던 것을 약 20분으로 단축한다. 핵심은 Instant-NGP에서 제안된 **다중 해상도 해시 인코딩**의 도입이다.

### 다중 해상도 해시 인코딩이란

- 3D 공간을 여러 스케일의 격자로 나누고, 각 격자점에 학습 가능한 특징 벡터를 저장
- 해시 테이블로 메모리를 절약하면서도 세밀한 디테일을 표현
- 신경망이 좌표를 직접 처리하는 대신, 이 특징 벡터를 받아 훨씬 빠르게 수렴

### 학습 전략

- **점진적 학습**(progressive training): 낮은 해상도에서 전체 형태를 먼저 잡고, 점차 높은 해상도를 활성화하여 디테일을 채움
- **점진적 확장**(incremental learning): 이미 학습된 장면에 새 관측을 추가하여 장면을 확장 가능

### NeuS 대비 개선

- **속도**: 수 시간 → 약 20분
- **품질**: NeuS의 볼륨 렌더링 품질을 유지
- **확장성**: 점진적 확장으로 커지는 장면에 대응 가능

### 실용적 의미

실내 디지털 트윈에서 메시 기반 3D 모델이 필요할 때 실용적이다. 3DGS가 렌더링에 강하다면, NeuS2는 **깔끔한 표면 메시**를 추출하는 데 강하다. CAD 소프트웨어 연동, 면적 계산, 물리 시뮬레이션 등 메시가 필수인 후처리 작업에 적합하다.`,
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

### 배경: NeuS에서 Neuralangelo까지

**NeuS**(Neural Implicit Surfaces)는 SDF 기반으로 깨끗한 메쉬를 뽑아냈지만 느리고 디테일이 부족했다. **Instant-NGP**의 해시 그리드 인코딩(3D 좌표를 빠르게 특징 벡터로 변환하는 룩업 테이블 방식)을 SDF에 직접 적용하면 속도는 빨라지지만 표면이 울퉁불퉁해지는 문제가 있었다. Neuralangelo는 이 둘을 **제대로** 결합한다.

### 핵심 기법 1: 수치적 그래디언트

해시 그리드는 불연속적인 룩업 구조이기 때문에, 일반적인 자동미분으로 SDF의 표면 법선을 계산하면 노이즈가 심하다. Neuralangelo는 미세한 간격의 두 점에서 SDF 값 차이를 직접 계산하는 **수치적 그래디언트** 방식을 사용한다. 이 간격이 자연스러운 스무딩 역할을 하여 안정적인 법선 추정이 가능해진다.

### 핵심 기법 2: Coarse-to-Fine 학습

해시 그리드의 해상도 레벨을 한꺼번에 활성화하지 않고, **저해상도에서 시작해 점진적으로 고해상도 레벨을 추가**한다. 먼저 대략적인 형태를 잡은 후 세부 디테일을 쌓아가는 방식으로, 학습이 안정적으로 수렴한다.

### 주요 결과

- DTU 벤치마크에서 NeuS 대비 약 **3.7배 정밀한** 메쉬 생성
- Tanks and Temples(대규모 실외 장면)에서도 압도적 품질

### 실용적 의미

실내 3D 디지털 트윈 구축 시, 사진만으로 벽면 몰딩이나 가구 곡면 같은 **세밀한 기하학적 디테일이 필요한 메쉬**를 얻을 수 있는 현재 최고 수준의 방법이다. 카메라 포즈만 확보되면 별도 깊이 센서 없이도 고품질 3D 모델 생성이 가능하다.`,
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

### 왜 ViT인가

기존 CNN 기반 인코더(ResNet 등)는 **수용 영역**(receptive field, 한 뉴런이 볼 수 있는 입력 범위)이 레이어를 쌓을수록 점진적으로 넓어진다. 반면 **ViT**(Vision Transformer)는 첫 레이어부터 모든 패치 간 self-attention을 수행하여 이미지 전체 맥락을 즉시 파악한다. 깊이 추정처럼 방 전체 구조를 한 번에 이해해야 하는 태스크에 근본적으로 유리하다.

### 아키텍처 구조

- **ViT 인코더**: 이미지를 패치로 분할하여 토큰화한 후 Transformer 레이어를 통과. 중간 레이어 4곳에서 특징을 추출
- **Reassemble 모듈**: ViT의 1D 토큰 시퀀스를 2D 특징맵으로 재구성하고, 각각 다른 해상도로 리사이즈하여 멀티스케일 특징 생성
- **Fusion 모듈**: 가장 깊은 특징부터 시작해 얕은 특징과 점진적으로 합치며 업샘플링. 최종적으로 입력 해상도와 동일한 깊이맵 출력

### MiDaS, Depth Anything과의 관계

DPT는 단독 논문이자 동시에 **후속 모델들의 디코더 표준**이 되었다.
- MiDaS v3가 DPT를 백본으로 채택
- Depth Anything이 DPT 디코더 구조를 그대로 계승 (인코더만 DINOv2로 교체)
- 현재 대부분의 단안 깊이 추정 모델이 이 Reassemble-Fusion 패턴을 따른다

### 실용적 의미

실내 3D 디지털 트윈 파이프라인에서 **깊이 추정 디코더의 사실상 표준 구조**이다. Depth Anything, Depth Pro 등 최신 모델의 결과를 이해하려면 DPT의 Reassemble-Fusion 구조를 알아두는 것이 핵심이다.`,
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

### Depth Anything V2와의 차이

Depth Anything V2는 기본적으로 **상대적 깊이**(relative depth, 가까운/먼 순서만 정확)를 출력하고 미터 단위 깊이는 별도 파인튜닝이 필요하다. Depth Pro는 처음부터 **미터 단위 절대 깊이**를 출력하며, 카메라 내부 파라미터(focal length 등) 없이도 동작한다. 또한 물체 경계가 매우 선명하다.

### 멀티스케일 ViT 아키텍처

Depth Pro의 핵심은 **같은 이미지를 여러 스케일로 동시에 처리**하는 것이다.
- **전체 이미지 스케일**: 방 전체의 구조와 공간 관계 파악
- **중간 타일**: 가구 수준의 기하학 포착
- **세밀한 타일**: 물체 경계와 디테일 보존
- 같은 ViT 인코더를 가중치 공유하며 재사용하고, 디코더에서 스케일별 특징을 점진적으로 결합

### 경계 선명도의 비결

- 고해상도 인코더 특징을 디코더에 **skip connection**으로 직접 전달
- 합성 데이터에서 픽셀 단위로 정확한 경계 학습

### 실용적 의미

실내 3D 디지털 트윈에서 **카메라 정보 없이 스마트폰 사진 한 장으로 미터 단위 깊이맵**을 바로 얻을 수 있다. 경계가 선명하기 때문에 가구와 벽의 구분이 깔끔하고, 이 깊이맵을 3DGS나 TSDF fusion의 초기값으로 사용하면 재구성 품질이 크게 올라간다.`,
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

- **Mip-NeRF 360**: 현존 최고 렌더링 품질이지만 학습에 수십 시간 소요
- **Instant-NGP**: 해시 그리드 덕분에 초고속이지만 **앨리어싱**(aliasing, 멀리 있는 물체가 깨지거나 번쩍이는 현상) 문제 존재
- Zip-NeRF는 해시 그리드의 속도를 유지하면서 Mip-NeRF 360 수준의 앨리어싱 방지를 달성

### 핵심 문제와 해결

Mip-NeRF의 앨리어싱 방지 기법은 연속 함수에 대한 적분으로 작동하는데, 해시 그리드는 이산적 룩업 테이블이라 이 적분을 직접 계산할 수 없다. Zip-NeRF는 이를 **멀티샘플링**으로 근사한다.
- 광선의 각 구간에서 여러 점을 샘플링하여 해시 그리드에 쿼리
- 결과를 가중 평균하여 해당 구간의 대표 특징 계산

### 주요 결과

- Mip-NeRF 360 데이터셋에서 실내/실외 모두 **최고 렌더링 품질**
- Mip-NeRF 360 대비 약 **48배 빠른** 학습 속도

### 실용적 의미

실내 3D 디지털 트윈에서 **최고 품질의 뷰 합성이 필요할 때**의 선택지이다. 특히 방 전체를 360도로 촬영한 경우, 가까운 가구부터 먼 벽면까지 스케일이 크게 달라지는데 Zip-NeRF는 이 모든 스케일에서 깨끗한 렌더링을 보장한다.`,
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

NeRF는 3D 공간의 밀도(density)를 학습하는데, 여기서 깔끔한 표면(메쉬)을 추출하기 어렵다. 밀도에 임계값을 적용해야 하는데 어떤 값이 맞는지 애매하고, 표면이 아닌 곳에서도 밀도가 높을 수 있어 노이즈가 많은 메쉬가 만들어진다.

### NeuS의 핵심 아이디어

밀도 대신 **SDF**(Signed Distance Function, 3D 공간의 각 점에서 가장 가까운 표면까지의 부호 있는 거리)를 학습한다. 표면은 SDF=0인 지점으로 명확히 정의되므로, **Marching Cubes**(SDF 격자에서 등위면을 삼각형 메쉬로 추출하는 알고리즘)로 깔끔한 메쉬를 바로 뽑을 수 있다.

### S-density 함수: SDF를 볼륨 렌더링에 연결

SDF를 NeRF의 볼륨 렌더링 프레임워크에서 학습하려면, SDF 값을 밀도로 변환해야 한다. NeuS는 렌더링 가중치의 최댓값이 정확히 표면(SDF=0) 위에 위치하는 **비편향(unbiased)** 변환 함수를 설계했다. 이 덕분에 어떤 형태의 표면이든 정확하게 복원된다.

### 자연스러운 Coarse-to-Fine

변환 함수의 날카로움을 조절하는 파라미터가 학습 과정에서 자동으로 증가한다. 초반에는 넓은 범위에서 색상 정보를 수집하여 대략적 형상을 잡고, 후반에는 표면 바로 위에서만 가중치가 집중되어 디테일을 학습한다.

### 실용적 의미

실내 3D 디지털 트윈에서 **사진만으로 깔끔한 메쉬를 추출하는 방법론의 출발점**이다. 벽, 바닥, 가구 등의 표면을 명시적 3D 모델로 얻을 수 있고, 이를 CAD 소프트웨어나 게임 엔진에서 직접 활용할 수 있다.`,
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

**단안 깊이 추정**(monocular depth estimation)은 사진 한 장에서 픽셀별 깊이맵을 예측하는 태스크이다. 본질적으로 하나의 2D 이미지에 무한한 3D 해석이 가능한 ill-posed 문제이며, 딥러닝이 대규모 데이터의 통계적 패턴으로 이를 극복한다.

### 방법론 분류

- **지도 학습(Supervised)**: LiDAR나 RGB-D 센서로 수집한 정답 깊이맵으로 학습. CNN에서 시작해 ViT(DPT), 대규모 데이터 활용(Depth Anything)까지 발전
- **자기 지도 학습(Self-supervised)**: 정답 깊이 없이 스테레오 쌍이나 연속 비디오 프레임 간의 광학적 일관성으로 학습. 데이터 수집이 쉽지만 절대 스케일을 알 수 없고 정확도가 상대적으로 낮음
- **반지도 / Pseudo-label**: Depth Anything 방식. 지도 학습 teacher가 비라벨 데이터에 깊이를 예측하고 student가 이를 학습. 현재 가장 강력한 접근법

### 상대적 깊이 vs 절대적 깊이

대부분 모델은 가까운/먼 순서만 맞는 **상대적 깊이**를 출력한다. 3D 재구성에는 미터 단위 **절대적 깊이**(metric depth)가 필요하며, Metric3D나 Depth Anything V2 metric 버전, Depth Pro 등이 이를 지원한다.

### 실용적 의미

실내 3D 디지털 트윈 파이프라인의 **입문 지도 역할**을 하는 서베이이다. 깊이 추정이 MonoSDF의 depth prior, GaussianRoom의 초기화, 3DGS의 정규화 등 다양한 하류 태스크에 어떻게 연결되는지 전체 그림을 파악하는 데 유용하다.`,
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

### 핵심 아이디어

3D 장면을 하나의 연속 함수로 표현한다. 공간의 한 점(x, y, z)과 바라보는 방향을 입력하면, 그 점의 색상과 밀도(얼마나 불투명한지)를 출력하는 MLP(다층 퍼셉트론)를 학습한다. **위치 인코딩**(positional encoding, 저차원 좌표를 고주파 삼각함수로 확장하여 세밀한 패턴을 표현 가능하게 만드는 기법)이 디테일 표현의 핵심이다.

### 볼륨 렌더링

카메라에서 각 픽셀을 향해 광선을 발사하고, 광선 위의 여러 점에서 색상과 밀도를 쿼리한 후 **가중합**으로 최종 픽셀 색상을 계산한다. 앞쪽의 불투명한 점이 뒤를 가리는 물리적 원리를 자연스럽게 모델링한다.

### 계층적 샘플링

광선 위의 점을 균일하게 샘플링하는 coarse 단계와, coarse 결과에서 밀도가 높은(=표면 근처) 영역에 집중 샘플링하는 fine 단계로 나누어 효율과 품질을 동시에 달성한다.

### 학습 방식

- 다시점 사진 수십~수백 장과 COLMAP으로 추출한 카메라 포즈 필요
- 순수하게 렌더링된 색상과 실제 사진의 차이만으로 학습
- 장면 하나당 별도 모델 학습 (per-scene optimization)

### 실용적 의미

실내 3D 디지털 트윈 분야의 **기초 중의 기초**이다. 이후 등장하는 Instant-NGP(속도), 3DGS(실시간), NeuS(메쉬), Zip-NeRF(품질), LERF(언어) 등 거의 모든 후속 논문이 NeRF의 볼륨 렌더링 프레임워크를 확장하거나 대체하는 방식으로 발전했다.`,
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

### DUSt3R에서 MASt3R로

**DUSt3R**는 이미지 쌍에서 3D 포인트맵을 직접 예측하지만, 두 이미지 간의 대응점(어떤 픽셀이 같은 3D 점을 보는지)은 암묵적으로만 추론된다. **MASt3R**는 여기에 **명시적 로컬 특징 매칭**(local feature matching, 두 이미지에서 같은 3D 점을 가리키는 픽셀 쌍을 직접 찾는 것)을 추가한다.

### 아키텍처

DUSt3R의 인코더-디코더 구조를 그대로 유지하면서, 디코더 출력에 **매칭 헤드**를 추가한다. 각 패치마다 짧은 특징 벡터를 출력하고, 두 이미지의 특징 벡터 간 유사도를 계산하여 대응점을 찾는다.

### 3D와 매칭의 상호 강화

이 논문의 핵심 통찰은 **3D 예측이 좋으면 매칭 학습이 쉬워지고, 매칭이 정확하면 3D 정렬이 더 잘 된다**는 상호 강화 효과이다. 두 태스크를 함께 학습하면 각각 따로 학습할 때보다 모두 성능이 올라간다.

### Global Alignment 개선

여러 장의 이미지를 하나의 3D 장면으로 합칠 때, DUSt3R는 포인트맵 정합만 사용하지만 MASt3R는 **명시적 대응점 제약을 추가**한다. 텍스처가 부족한 영역(흰 벽 등)에서도 안정적인 정렬이 가능해진다.

### 실용적 의미

실내 3D 디지털 트윈 구축 시 **스마트폰으로 찍은 다수의 사진을 정렬하는 첫 단계**에서 가장 실용적인 도구이다. 특히 실내 환경의 흰 벽이나 반복 패턴 같은 어려운 조건에서 DUSt3R보다 안정적으로 동작한다.`,
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

### 실내에서 3DGS의 문제

기본 **3DGS**(3D Gaussian Splatting)는 실내 환경에서 세 가지 문제를 보인다.
- 텍스처 없는 영역(흰 벽, 천장)에 가우시안이 제대로 배치되지 않아 구멍 발생
- 가우시안이 표면에 정렬되지 않고 공중에 떠다녀 깊이맵에 노이즈
- 코너나 천장 등 촬영 횟수가 적은 곳에서 아티팩트 발생

### 해결 전략: 단안 Prior + SDF 가이드

- **깊이 Prior**: 사전학습된 단안 깊이 모델의 예측을 깊이 supervision으로 활용. 텍스처 없는 벽에서도 깊이 정보 제공
- **법선 Prior**: 사전학습된 법선 모델의 예측으로 가우시안이 표면에 정렬되도록 유도
- **SDF 기반 가지치기**: 학습된 가우시안에서 TSDF(깊이 정보를 3D 격자에 융합한 표현)를 추출하고, 표면에서 먼 부유 가우시안을 제거

### 메쉬 추출

가우시안에서 렌더링한 깊이맵들을 TSDF fusion으로 합치고 Marching Cubes로 메쉬를 추출한다. 이 메쉬를 다시 가우시안 학습의 제약으로 사용하는 반복 정제 과정을 거친다.

### 주요 결과

- ScanNet에서 기본 3DGS 대비 깊이 오차 절반 이하로 감소
- 벽과 바닥 같은 대형 평면의 품질 개선이 특히 두드러짐

### 실용적 의미

실내 3D 디지털 트윈에 **가장 직접적으로 관련된 논문**이다. 실시간 렌더링이 가능한 3DGS의 장점을 유지하면서 실내 특유의 넓은 평면, 텍스처 부족 문제를 해결한다.`,
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

NeuS나 VolSDF는 색상 차이(photometric loss)만으로 SDF를 학습한다. 이 방식은 텍스처가 풍부한 영역에서는 잘 작동하지만, **흰 벽, 바닥, 천장** 같은 텍스처 부족 영역에서는 색상 변화가 거의 없어 SDF 최적화 방향을 잡지 못한다.

### MonoSDF의 해결책

사전학습된 **단안 깊이 모델**과 **단안 법선 모델**의 예측을 추가 supervision으로 활용한다.
- **깊이 Prior**: 단안 깊이 모델이 예측한 상대적 깊이 패턴을 렌더링된 깊이와 비교. 절대 스케일은 모르지만 "이 부분이 저 부분보다 가깝다"는 정보가 평면 영역에서 강력한 가이드 역할
- **법선 Prior**: 표면 법선 방향을 제약하여 벽이 평평하게, 코너가 직각으로 복원되도록 유도
- 두 prior를 함께 사용하면 각각 단독 사용 대비 **상호 보완 효과**로 성능이 크게 향상

### 주요 결과

- ScanNet(실내)에서 기존 대비 표면 품질이 크게 향상
- 텍스처 부족 영역과 적은 뷰(10~20장) 상황에서 개선 폭이 특히 큼

### 실용적 의미

실내 3D 디지털 트윈에서 **"단안 prior를 기하학 학습에 활용한다"는 패러다임을 확립한 논문**이다. 이후 GaussianRoom 등 실내 특화 3DGS 방법들이 모두 이 전략을 계승했다. 실내 환경의 고질적 문제인 텍스처 없는 벽면 재구성에 대한 핵심 해법이다.`,
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

NeRF의 각 3D 포인트에 색상과 밀도뿐 아니라 **CLIP 언어 특징**(CLIP feature, 이미지와 텍스트를 같은 벡터 공간에 매핑하는 OpenAI의 모델이 출력하는 벡터)을 함께 저장한다. 학습 후 아무 텍스트를 입력하면 3D 공간에서 해당 영역이 밝게 표시되는 히트맵을 생성할 수 있다.

### 멀티스케일 CLIP 학습

**CLIP은 이미지 패치 단위로 작동**하므로 3D 포인트 하나에 직접 supervision을 줄 수 없다. LERF는 학습 이미지에서 다양한 크기의 크롭(물체 수준, 부분 수준, 장면 수준)을 만들고, 각 크롭의 CLIP 특징과 해당 3D 영역의 렌더링된 특징을 일치시키는 방식으로 학습한다.

### 스케일 인식 쿼리

각 3D 포인트에 **스케일 파라미터**도 함께 학습한다. "mug"(작은 물체)와 "kitchen"(큰 영역)은 서로 다른 공간 스케일에서 의미가 있는데, 이 파라미터가 적절한 스케일에서 비교가 이루어지도록 한다. 사전 정의된 카테고리 없이 **개방형 어휘(open-vocabulary)** 쿼리가 가능하다.

### 실용적 의미

실내 3D 디지털 트윈에 **의미론적 이해(semantic understanding)를 부여하는 핵심 기술**이다. 재구성된 3D 공간에서 "소파 어디 있어?", "창문 근처 영역 보여줘"와 같은 자연어 쿼리가 가능해져, 단순한 기하학적 복원을 넘어 **상호작용 가능한 지능형 공간 모델**로 발전하는 기반이 된다.`,
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
    summaryKo: `## SplaTAM-S / Splat-SLAM (ECCV 2024)

### 핵심 아이디어

기존 SplaTAM을 개선한 **Gaussian Splatting 기반 SLAM** 시스템이다. SLAM(Simultaneous Localization and Mapping)은 카메라가 움직이면서 자기 위치를 추정하고 동시에 3D 지도를 만드는 기술인데, 이 논문은 3D Gaussian을 지도 표현으로 쓴다.

### 무엇이 달라졌나

- **루프 클로저(Loop Closure)** 강화: 이전에 방문한 장소를 다시 인식하면 누적 오차를 한꺼번에 보정
- **글로벌 최적화**: 지역적 트래킹에 의존하던 기존 방식 대비 전체 궤적을 일괄 보정해 드리프트를 줄인다
- **단안 카메라(Monocular) 지원**: RGB-D 센서 없이도 **깊이 예측 네트워크**로 depth를 보완해 동작
- 넓은 실내 환경에서 기존 SplaTAM 대비 트래킹 안정성이 눈에 띄게 향상

### 실용적 의미

실내 3D 디지털 트윈을 만들려면 넓은 공간을 돌아다니며 스캔해야 하는데, 루프 클로저가 없으면 복도를 한 바퀴 돌았을 때 지도가 어긋난다. Splat-SLAM은 이 문제를 해결하면서도 Gaussian 기반이라 스캔 결과를 바로 실시간 렌더링에 활용할 수 있다.`,
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
    summaryKo: `## Gaussian Surfels

### 핵심 아이디어

3D Gaussian Splatting의 약점인 **표면 품질**을 개선한 논문이다. 기존 3DGS의 Gaussian은 공중에 떠다니는 3차원 타원체인데, 이걸 **서펠(Surfel, Surface Element)** — 즉 표면에 달라붙는 납작한 2D 디스크로 바꾼다.

### 접근 방식

- 3D Gaussian의 축 하나를 0에 가깝게 눌러서 **2D 디스크** 형태로 강제한다
- 각 디스크가 실제 표면 위에 정렬되도록 **법선(Normal) 정규화**와 **깊이(Depth) 정규화**를 적용한다
- 단안 카메라 깊이/법선 추정 모델의 예측값을 사전 지식(Prior)으로 활용한다
- 최종 메쉬 추출은 렌더링된 깊이 맵에 **TSDF Fusion**(깊이 값을 3D 격자에 누적하는 방식)을 적용해 수행한다

### 왜 중요한가

- 기존 3DGS는 렌더링은 예쁘지만 메쉬로 변환하면 울퉁불퉁하고 구멍이 많았다
- Gaussian Surfels는 Gaussian 자체가 표면을 표현하므로 **깨끗한 메쉬**를 뽑을 수 있다
- 렌더링 속도는 기존 3DGS와 비슷하게 실시간 수준을 유지

### 실용적 의미

디지털 트윈에서는 보기 좋은 렌더링만으로는 부족하고 벽·바닥·가구의 **정확한 3D 메쉬**가 필요하다. Gaussian Surfels는 실시간 렌더링과 정밀 메쉬 추출을 동시에 달성해, 스캔 → 메쉬 → 디지털 트윈 변환 파이프라인에 실질적으로 유용하다.`,
  },

  // ─── Other ─────────────────────────────────────────
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
    summaryKo: `## 3D Gaussian Splatting (SIGGRAPH 2023)

### 핵심 아이디어

장면을 수백만 개의 **3D Gaussian**으로 표현하는 새로운 실시간 렌더링 방법이다. 각 Gaussian은 위치, 모양(공분산), 투명도, 색상 정보를 갖고 있으며, 이들을 화면에 "뿌려서(Splatting)" 이미지를 만든다.

### 구조 요약

- **초기화**: SfM(Structure from Motion)으로 얻은 희소 포인트 클라우드에서 시작
- **미분 가능 래스터라이저**: 타일 기반으로 Gaussian을 정렬·렌더링하며, 기울기가 역전파되어 Gaussian 파라미터를 학습
- **적응적 밀도 제어**: 학습 도중 Gaussian을 분할(Split), 복제(Clone), 제거(Prune)해 필요한 곳에 밀도를 높인다

### 왜 혁신적인가

- **실시간 렌더링**: NeRF가 초당 수 프레임이던 시절에 100fps 이상을 달성
- **고품질 유지**: 화질 지표에서 NeRF 계열과 동등하거나 우수
- **명시적 표현**: Gaussian이 공간에 실체로 존재하므로 편집, 합성, 물리 시뮬레이션 연동이 NeRF보다 직관적

### 실용적 의미

디지털 트윈의 **시각적 표현 계층**으로 이상적이다. 실내 공간을 사진 몇십 장으로 촬영한 뒤 학습하면 사실적인 실시간 뷰를 제공할 수 있고, 이후 파이프라인(의미 분할, 편집 등)에 연결하기도 NeRF보다 수월하다.`,
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
    summaryKo: `## LangSplat (CVPR 2024)

### 핵심 아이디어

3D Gaussian 하나하나에 **언어 특징(Language Feature)**을 심어서, 텍스트로 3D 공간을 검색할 수 있게 만든 논문이다. 예를 들어 "빨간 의자"라고 입력하면 3D 장면 안에서 해당 Gaussian들이 하이라이트된다.

### 접근 방식

- 각 Gaussian에 **CLIP 특징**(이미지-텍스트 쌍을 같은 공간에 매핑하는 사전학습 모델의 벡터)을 저장
- CLIP 특징은 차원이 높으므로 **오토인코더**로 압축한 저차원 벡터를 Gaussian에 붙인다
- 렌더링 시 언어 특징도 함께 래스터라이즈해서 2D 관련도 맵을 실시간으로 생성
- 텍스트 쿼리와 각 Gaussian의 언어 특징 간 유사도를 계산해 **3D 관련도 맵**을 산출

### 기존 방법 대비 장점

- **LERF**(NeRF 기반 언어 임베딩)보다 훨씬 빠르다 — Gaussian 래스터라이제이션 덕분
- 개방형 어휘(Open-Vocabulary) 검색이 가능해 사전 정의된 카테고리에 제한되지 않는다

### 실용적 의미

실내 디지털 트윈에서 "소화기", "비상구 표지판" 같은 텍스트로 공간 내 객체를 즉시 검색할 수 있다. 시설 관리, 인벤토리, 접근성 검토 등 디지털 트윈을 **검색 가능한 3D 데이터베이스**로 활용하는 데 핵심 기술이다.`,
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
    summaryKo: `## 2D Gaussian Splatting (SIGGRAPH 2024)

### 핵심 아이디어

3DGS의 3D 타원체 Gaussian을 **2D 평면 디스크**로 축소한 논문이다. Gaussian Surfels와 유사한 철학이지만, 렌더링 수학 자체를 2D 디스크에 맞게 재설계한 점이 다르다.

### 접근 방식

- 각 Gaussian을 3D 공간의 **평면 디스크(서펠)**로 정의한다
- **레이-스플랫 교차(Ray-Splat Intersection)**: 카메라 광선과 2D 디스크의 교점을 정확히 계산해 깊이를 구한다
- **원근 보정(Perspective-Correct) 렌더링**: 3DGS의 근사적 투영 대신 기하학적으로 정확한 투영을 수행
- 이 덕분에 깊이 맵의 정밀도가 크게 올라가고, 메쉬 추출 품질이 향상된다

### 3DGS와 비교

- **기하 품질**: 메쉬 추출 시 3DGS 대비 훨씬 깨끗하고 정확한 표면
- **렌더링 속도**: 여전히 실시간 수준 유지
- **렌더링 화질**: 3DGS와 동등하거나 약간 우수

### 실용적 의미

실내 디지털 트윈에서 벽·바닥·천장 같은 평면 구조가 많으므로, 2D 디스크 표현이 본질적으로 잘 맞는다. 정확한 깊이와 메쉬 추출이 가능해 **CAD 수준의 공간 모델링**에 한 걸음 더 가까워진 접근이다.`,
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
    summaryKo: `## Nerfstudio (SIGGRAPH 2023)

### 핵심 아이디어

NeRF와 3DGS 연구·개발을 위한 **모듈식 오픈소스 프레임워크**다. 개별 논문 구현을 밑바닥부터 짜는 대신, 공통 파이프라인 위에서 부품을 교체하듯 실험할 수 있게 해준다.

### 주요 구성

- **데이터 파서**: COLMAP, Polycam, Record3D 등 다양한 입력 포맷 지원
- **모델**: Nerfacto(NeRF 종합), Splatfacto(3DGS 기반) 등 주요 방법을 플러그인 형태로 제공
- **뷰어**: 웹 기반 실시간 3D 뷰어로 학습 중에도 결과를 확인 가능
- **CLI 도구**: 데이터 전처리 → 학습 → 평가 → 내보내기까지 커맨드 한 줄로 수행

### 왜 중요한가

- 논문마다 제각각인 코드베이스를 통일된 인터페이스로 감싸 **재현성**과 **비교 용이성**을 높인다
- 새 방법을 구현할 때 데이터 로딩, 렌더링 루프 등 보일러플레이트를 직접 짤 필요가 없다
- 연구자뿐 아니라 응용 개발자도 빠르게 프로토타이핑할 수 있는 생태계

### 실용적 의미

디지털 트윈 파이프라인을 만들 때 Nerfstudio를 백본으로 쓰면, 데이터 수집 → 3D 복원 → 렌더링 → 내보내기 과정을 빠르게 구축할 수 있다. 새로운 3DGS 변종이 나와도 Splatfacto 플러그인만 교체하면 되므로, **프로덕션과 연구 사이의 다리 역할**을 한다.`,
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
    summaryKo: `## COLMAP (CVPR 2016 / ECCV 2016)

### 핵심 아이디어

사진 여러 장에서 **카메라 위치**와 **희소 3D 포인트 클라우드**를 복원하는 고전적 파이프라인이다. **SfM(Structure from Motion)**과 **MVS(Multi-View Stereo)** 두 단계로 구성된다.

### 파이프라인 구조

- **특징 추출**: 각 이미지에서 SIFT 같은 특징점을 찾는다
- **특징 매칭**: 이미지 쌍 간 대응점을 찾는다
- **점진적 복원(Incremental SfM)**: 이미지를 하나씩 추가하며 카메라 포즈와 3D 점을 동시에 추정
- **번들 조정(Bundle Adjustment)**: 전체 카메라·점 파라미터를 한꺼번에 최적화해 정밀도 향상
- **밀집 복원(MVS)**: 픽셀 단위 깊이 맵 → 밀집 포인트 클라우드 → 메시 생성

### 왜 아직도 쓰이나

- NeRF, 3DGS 등 거의 모든 뉴럴 3D 복원 방법이 **입력으로 COLMAP의 카메라 포즈를 요구**한다
- 수십 년간 검증된 안정성과 정밀도
- GPU 가속 매칭, 다양한 카메라 모델 지원 등 실용적 완성도가 높다

### 실용적 의미

실내 디지털 트윈의 **첫 번째 단계**다. 스마트폰으로 촬영한 사진을 COLMAP에 넣으면 카메라 궤적과 초기 포인트 클라우드가 나오고, 이걸 3DGS나 NeRF에 넘겨 고품질 3D 모델을 만든다. 파이프라인에서 빠질 수 없는 기반 도구이다.`,
  },
  {
    id: "instantsplat",
    title: "InstantSplat: Unbounded Sparse-view Pose-free Gaussian Splatting in 40 Seconds",
    group: "other",
    venue: "arXiv 2024",
    year: 2024,
    paperUrl: "https://arxiv.org/abs/2403.20309",
    tagKo: "3DGS (빠른 초기화)",
    oneLineKo:
      "COLMAP 없이 소수 사진만으로 즉시 3DGS 모델 생성. DUSt3R + 3DGS 결합.",
    summaryKo: `## InstantSplat (arXiv 2024)

### 핵심 아이디어

**COLMAP 없이** 소수의 비보정 사진만으로 즉시 3D Gaussian Splatting 모델을 만드는 방법이다. **DUSt3R**(학습 기반 스테레오 매칭 모델)의 밀집 3D 점 예측을 3DGS 초기화에 바로 활용한다.

### 파이프라인

- 비보정 사진 수 장(2~12장)을 입력
- **DUSt3R**가 이미지 쌍에서 **밀집 포인트맵**과 **카메라 포즈**를 동시에 예측
- 예측된 3D 점으로 Gaussian을 초기화하고 짧은 최적화를 수행
- 결과: 몇 분 이내에 렌더링 가능한 3DGS 모델 완성

### 왜 중요한가

- 기존 3DGS는 COLMAP으로 수십 분~수 시간 전처리가 필요했다
- InstantSplat은 이 과정을 **학습 기반 모델로 대체**해 파이프라인을 극적으로 단순화
- 캐주얼하게 찍은 소수 사진으로도 동작하므로 전문 장비나 촬영 프로토콜이 불필요

### 한계

- DUSt3R 예측 품질에 의존하므로 텍스처가 없는 영역이나 반복 패턴에서 정밀도가 떨어질 수 있다
- 대규모 장면에서는 아직 COLMAP 기반 대비 정밀도 격차가 있다

### 실용적 의미

디지털 트윈 구축의 **진입 장벽을 낮추는** 핵심 기술이다. 비전문가가 스마트폰으로 방 사진 몇 장을 찍으면 바로 3D 모델이 나오는 워크플로우가 가능해진다. 빠른 프리뷰 → 정밀 스캔의 2단계 파이프라인에서 1단계로 활용하기 좋다.`,
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
    summaryKo: `## 3D Gaussian Splatting SLAM Survey (arXiv 2025)

### 핵심 아이디어

3DGS 기반 SLAM 방법들을 **체계적으로 분류·비교**한 서베이 논문이다. 이 분야가 빠르게 발전하고 있어 전체 지형을 파악하는 데 유용하다.

### 분류 체계

- **트래킹 전략**
  - Analysis-by-Synthesis: 렌더링 결과와 실제 이미지 차이를 최소화하며 포즈 추정
  - Feature 기반: 전통적 특징점 매칭으로 포즈를 구하고 Gaussian 맵만 별도 관리
- **입력 모달리티**: RGB-D(깊이 센서 포함), 단안(Monocular), 스테레오
- **매핑 방식**: 전역 맵 vs 서브맵, 키프레임 선택 전략, Gaussian 밀도 관리

### 다루는 주요 방법들

- **SplaTAM**: RGB-D 기반 최초의 3DGS SLAM
- **MonoGS**: 단안 입력 3DGS SLAM
- **Photo-SLAM**: 사진 측량 수준 정밀도를 목표로 한 하이브리드
- **GS-SLAM** 등 다수 비교

### 공통 과제

- 대규모 환경에서의 확장성
- 동적 객체 처리
- 루프 클로저와 전역 일관성

### 실용적 의미

실내 디지털 트윈에 어떤 SLAM 방법을 선택할지 결정할 때 **로드맵 역할**을 한다. 센서 종류(깊이 카메라 유무), 공간 크기, 실시간 요구사항에 따라 적합한 방법을 이 서베이에서 빠르게 식별할 수 있다.`,
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
    summaryKo: `## Room Layout Estimation

### 핵심 아이디어

단일 이미지 또는 파노라마에서 **방의 3D 구조**(벽, 바닥, 천장의 위치와 각도)를 추정하는 기술 분야다.

### 주요 접근 방식

- **큐보이드 가정(Cuboid Assumption)**: 방이 직육면체라고 가정하고, **맨해튼 월드**(벽이 직교한다는 가정) 하에서 모서리와 면을 추정
- **단일 이미지 기반**: 소실점(Vanishing Point)과 에지 검출로 레이아웃 추론. 최근에는 트랜스포머로 코너·에지를 직접 예측
- **파노라마 기반**: 360도 이미지에서 전체 방 레이아웃을 한 번에 추정
  - **HorizonNet** 등의 방법이 파노라마 수평선 위의 천장·바닥 경계를 예측
  - 시야각 제한 없이 방 전체를 커버하는 장점

### 왜 중요한가

- 3DGS나 NeRF가 만드는 것은 시각적 표현이고, Room Layout은 **구조적 뼈대**를 제공한다
- 벽·바닥·천장의 평면 방정식을 알면 면적 계산, 가구 배치 시뮬레이션, 충돌 감지가 가능하다

### 실용적 의미

디지털 트윈에서 3DGS의 시각 표현과 Room Layout의 구조 정보를 결합하면, "보기 좋으면서도 치수가 정확한" 모델을 만들 수 있다. 부동산 플랫폼, 인테리어 시뮬레이션, 시설 관리 시스템의 **공간 이해 기반 계층**으로 활용된다.`,
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
    summaryKo: `## OpenLRM (2024)

### 핵심 아이디어

이미지 한 장(또는 소수)을 넣으면 **한 번의 순전파(Forward Pass)**로 3D 모델을 출력하는 **대규모 복원 모델(Large Reconstruction Model)**이다. 장면별 최적화 없이 일반화된 3D 생성이 가능하다.

### 접근 방식

- **트랜스포머 기반 아키텍처**: 이미지 토큰을 입력받아 **트라이플레인(Triplane)** 또는 NeRF 표현을 직접 예측
- **Objaverse 학습**: 대규모 3D 오브젝트 데이터셋으로 사전학습해 다양한 물체에 일반화
- 추론 시 최적화 루프가 없으므로 **수 초 내 결과**를 얻을 수 있다

### 강점과 한계

- **강점**: 단일 이미지에서 즉시 3D를 생성하는 속도와 편의성
- **한계**: 주로 **오브젝트 수준** 복원에 특화되어 있어, 전체 실내 장면 복원에는 아직 적용이 어렵다
- 보이지 않는 뒷면의 형상은 학습된 사전 지식으로 "추측"하므로 정밀도에 한계가 있다

### 실용적 의미

디지털 트윈에서 방 안의 **개별 가구·소품을 빠르게 3D 에셋으로 만드는** 용도로 활용할 수 있다. 예를 들어 카탈로그 사진 한 장에서 의자 3D 모델을 즉시 생성해 디지털 트윈 공간에 배치하는 워크플로우가 가능하다. 다만 방 전체 복원에는 3DGS 계열을 병행해야 한다.`,
  },
];

// ─── helpers ─────────────────────────────────────────

export function getPicksByGroup(group: Pick["group"]): Pick[] {
  return picks.filter((p) => p.group === group);
}

export function getPickById(id: string): Pick | undefined {
  return picks.find((p) => p.id === id);
}

export function getAllPicks(): Pick[] {
  return picks;
}
