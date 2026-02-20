# Setup Guide

 MVP 프로젝트를 로컬 환경에서 실행하는 방법입니다.

## 1. 사전 요구사항
이 프로젝트는 **PostgreSQL + PostGIS** 익스텐션이 필요합니다.  
로컬에 Docker가 없는 경우, Supabase, Vercel Postgres, Neon 등 외부 무료 클라우드 DB에 가입하여 DB URL을 발급받은 뒤 PostGIS 익스텐션을 활성화해야 합니다. (예: `CREATE EXTENSION postgis;`)

## 2. 환경 변수 설정
프로젝트 루트 디렉토리에 `.env` 파일을 만들고, `.env.example`의 내용을 복사합니다.

```sh
cp .env.example .env
```

발급받은 DB의 URL 등을 `.env`에 올바르게 기입합니다.

## 3. 의존성 설치
```sh
npm install
```

## 4. DB 스키마 생성 및 마이그레이션 적용
Prisma 툴킷을 이용해 스키마를 데이터베이스에 반영합니다. PostGIS를 사용하기 때문에 Postgres 내에 `postgis` 확장이 필수로 설치되어 있어야 합니다.

```sh
# 데이터베이스 스키마 마이그레이션 (동시에 Prisma Client 생성)
npx prisma migrate dev --name init
```

*참고: 아직 DB를 띄우지 못해서 마이그레이션 폴더(`prisma/migrations`)가 생기지 않았다면, DB 연결 설정이 완료된 후 위 명령어를 실행해야 합니다.*

## 5. (필수) 초기 샘플 데이터 주입 (Seeding)
지도에 기본 핀이 뜰 수 있도록 30개의 북유럽/발트/글로벌 미술관 샘플 데이터를 주입합니다. (PostGIS 좌표 변환 로직 포함)
```sh
npx prisma db seed
```

## 6. 로컬 서버 실행
```sh
npm run dev
```

서버가 구동되면 `http://localhost:3000` 에서 접속하여 프로젝트를 확인할 수 있습니다.
