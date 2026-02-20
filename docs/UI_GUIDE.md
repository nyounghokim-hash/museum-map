# UI Guide: Glassmorphism Design System

## 핵심 철학 (Core Philosophy)
1. **Glassmorphism**: 배경을 흐리게(blur) 처리하고 반투명한 흰색(또는 검은색) 레이어를 얹어 지도가 투과되어 보이게 합니다.
2. **가독성 최우선 (High Readability)**: 블러가 과하지 않아야 하며, 텍스트가 위치할 곳의 대비(Contrast)를 충분히 주어 글씨가 또렷하게 보이게 합니다.
3. **행동 유도 (Clear CTAs)**: 주요 버튼(Save, Plan, Review)은 불투명하고 대비가 강한 색상(주로 검은색, 파란색)을 사용하여 눈에 띄게 합니다.

## Tailwind CSS 유틸리티 (Tailwind Utilities)

### 1. 기본 글래스 패널 (Base Glass Panel)
- **Class**: `bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl`
- **Use Case**: 바텀시트, 사이드 패널, 모달 창 배경

### 2. 필터 칩 (Filter Chips)
- **Class (비활성)**: `bg-white/60 backdrop-blur-md border border-gray-200 text-gray-700 hover:bg-white/80 transition-colors`
- **Class (활성)**: `bg-black/90 text-white shadow-md`
- **Use Case**: 맵 상단의 "공립", "사립", "재단" 필터링 버튼

### 3. 주요 버튼 (Primary CTA)
- **Class**: `bg-black text-white font-bold rounded-xl shadow-lg hover:bg-neutral-800 transition-all active:scale-95`
- **Use Case**: 저장하기, 동선 만들기, 리뷰 작성하기

### 4. 타이포그래피 (Typography)
- **Title**: `text-2xl font-extrabold text-gray-900 tracking-tight`
- **Body**: `text-sm text-gray-700 leading-relaxed`
- **Caption**: `text-xs text-gray-500 font-medium`

## 컴포넌트 패턴 (Component Patterns)
- **바텀시트 (Bottom Sheet)**: 모바일 환경에서 지도를 가리지 않기 위해 화면 하단에서 올라오는 형태. 데스크탑에서는 좌측 사이드바로 변환.
- **클러스터 (Marker Cluster)**: 지도를 축소했을 때 마커가 겹치지 않도록 숫자 원형 배지로 그룹화. (`supercluster` 활용 또는 MapLibre 내장 클러스터링)
- **토스트 알림 (Toast/Alert)**: 성공적인 흐름 전환 시 화면 상단/하단 중앙에 작게 뜨는 반투명 알람.
