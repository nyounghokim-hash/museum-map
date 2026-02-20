# Global Contemporary Museums Map MVP - Architecture

## 아키텍처 원칙 (Architecture Principles)
1. **Next.js App Router**: `src/app` 폴더 기반의 서버/클라이언트 컴포넌트 혼합 (SEO + 빠른 초기 로딩).
2. **모듈 단위 결합도 완화 (Feature/Module-based)**:
   - 각 기능(Museum, Collection, Plan, Review)은 `src/components/{feature}` 또는 `src/lib/services/{feature}`로 분리.
3. **상태 관리**:
   - 로컬 UI 상태: React `useState`, 클라이언트 문맥 전달을 위한 `useContext` (전역 스토어 남용 방지).
   - 서버 상태: App Router의 Server Components 내 비동기 데이터 패칭 및 Next.js `fetch` 캐싱.
   - 복잡한 클라이언트 상태(지도 드래그, 핀 로딩 등): 전용 Hook (`useMapState`)으로 캡슐화.

## 폴더 구조 (Folder Structure)
```
/src
  /app                       # (Next.js 라우팅) 화면 및 API 진입점
    /(main)/page.tsx         # 메인 지도 화면 (Map, Search, Filter) -> / 루트 경로
    /museums/[id]/page.tsx   # 미술관 상세 (서버사이드 렌더링)
    /collections/            # 비공개/공개 컬렉션 관리 (생성 및 공유 뷰)
    /plans/                  # AutoRoute 및 플랜 보관
    /challenges/             # 월간 챌린지 뷰 (Opt-in)
    /admin/                  # 간단한 어드민 및 제보/검수 페이지
    /api/                    # 서버리스 API (Next.js Route Handlers)
      /museums               # 미술관 데이터 (위치 기반 쿼리 등)
      /collections           # 폴더/컬렉션 CRUD
      /plans                 # 동선(Plan) CRUD
      /reviews               # 3줄 리뷰 및 방문 로직

  /components                # (React 컴포넌트) App Router 밖에서 재사용되는 UI 컴포넌트
    /layout                  # 내비게이션 바, 사이드바, 하단 패널 등
    /map                     # MapLibre-gl 래퍼 및 마커 컴포넌트
    /museum                  # 미술관 카드, 리뷰 폼 등 도메인 종속 컴포넌트
    /ui                      # shadcn/ui 기반 공통 버튼, 인풋, 모달 UI (디자인 시스템)

  /lib                       # (유틸리티 및 서비스) 비즈니스 로직
    /prisma.ts               # Prisma 클라이언트 싱글톤
    /services                # 각 도메인별 주요 로직 (예: DB 조작 추상화 계층)
    /utils.ts                # Tailwind 병합(cn) 등 순수 함수 유틸

/docs                        # (문서화) 아키텍처, 셋업, 흐름 정의
/prisma                      # (DB 스키마) schema.prisma (PostGIS 확장 포함)
```

## 데이터베이스 패턴 (Database Layer)
- **PostGIS**: `location Unsupported("geometry(Point, 4326)")` 필드를 이용하여 지도 중심 좌표로부터의 거리(Radius) 검색 등을 DB 단에서 신속히 처리.
- **ORM (Prisma)**: 관계형 데이터 매핑(`User` -> `Collection` -> `SavedMuseum` -> `Museum`). 
- **트랜잭션**: 플랜 생성, 폴더 저장 시 원자성을 보장하기 위해 Prisma Transaction 블록 사용.

## 인증 및 보안
- **NextAuth.js**: 소셜 로그인 또는 이메일 패스워드 없는 Magic Link 활용.
- **인가 (Authorization)**: 컬렉션/루트 등은 `userId`와 세션의 토큰값을 대조하여 미들웨어(`middleware.ts`)에서 보호.
