# susurotalk (스스로톡) — Claude Code 하네스

아이 스스로 공부 습관 앱. pnpm + Turborepo 모노레포.

## 프로젝트 구조

```
apps/
  api/            — Express 4 + TypeScript (포트 4000)
  student-mobile/ — Expo SDK 54 + React Native (포트 8081)
  mentor-admin/   — 멘토 관리자 웹
  parent-admin/   — 학부모 관리자 웹
packages/
  db/             — Prisma Client v5 + Supabase PostgreSQL
  auth/           — 인증 유틸리티
  api-client/     — axios 기반 공유 API 클라이언트
  core-ui/        — 공유 UI 컴포넌트
  backend-utils/  — 서버 공유 유틸리티
  domain/         — 도메인 타입 / 상수
  config/         — 공유 설정
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 패키지 매니저 | pnpm workspace |
| 빌드 오케스트레이션 | Turborepo 2 |
| 백엔드 | Express 4.21 + TypeScript + tsx (dev) + esbuild (build) |
| 모바일 | Expo SDK 54 + expo-router 4 + Zustand 5 |
| DB | Supabase PostgreSQL + Prisma 5 |
| 인증 | Passwordless SMS OTP (Supabase Auth + 자체 JWT) |
| 배포 | Railway (API), EAS Build (모바일) |

## 개발 명령어

```bash
# 전체 개발 서버 (api + mobile 동시)
pnpm dev

# 개별 앱
pnpm --filter @seolf-talk/api dev
pnpm --filter @seolf-talk/student-mobile dev

# 빌드
pnpm build
pnpm --filter @seolf-talk/api build

# 린트
pnpm lint
```

## Prisma 명령어 — 반드시 workspace filter 사용

```bash
# 스키마 변경 후 클라이언트 재생성
pnpm --filter @seolf-talk/db exec prisma generate

# 마이그레이션 (실제 Supabase env 필요)
pnpm --filter @seolf-talk/db exec prisma migrate dev --name <이름>

# DB 상태 확인
pnpm --filter @seolf-talk/db exec prisma studio
```

> `npx prisma` 사용 금지 — Prisma v7이 설치되어 schema 문법 충돌 발생

## 환경변수

**`apps/api/.env`**
```
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=        # 최소 32자
PORT=4000
```

**`apps/student-mobile/.env`**
```
EXPO_PUBLIC_API_URL=http://localhost:4000
```

환경변수 검증은 `apps/api/src/config.ts` (Zod)에서 서버 시작 전 수행.

## 주요 파일 위치

| 목적 | 경로 |
|------|------|
| API 라우터 | `apps/api/src/routes/` — auth.ts, task.ts, profile.ts |
| JWT 미들웨어 | `apps/api/src/middleware/auth.ts` |
| 에러 핸들러 | `apps/api/src/middleware/errorHandler.ts` |
| Prisma 스키마 | `packages/db/prisma/schema.prisma` |
| PrismaClient 싱글톤 | `packages/db/src/index.ts` |
| 앱 상태 (인증) | `apps/student-mobile/src/store/authStore.ts` |
| API 클라이언트 | `apps/student-mobile/src/lib/api.ts` |

## 코딩 컨벤션

- TypeScript strict mode 사용
- 라우트 핸들러는 `async/await` + 공통 에러 핸들러로 예외 위임
- 환경변수는 Zod 스키마로 검증 후 export, 직접 `process.env` 참조 금지
- 새 패키지명 형식: `@seolf-talk/<name>`
- 모바일 네비게이션: expo-router (파일 기반 라우팅)

## 배포

- **API**: `apps/api/Dockerfile` + `railway.json` → Railway 자동 배포
- **모바일**: `apps/student-mobile/eas.json` → EAS Build
  - `eas.json`의 `EXPO_PUBLIC_API_URL`을 실제 Railway URL로 교체 필요

## Claude에게 — 작업 가이드라인

1. Prisma 관련 작업은 항상 `pnpm --filter @seolf-talk/db exec prisma` 사용
2. 새 API 라우트 추가 시 `apps/api/src/routes/`에 파일 생성 후 `app.ts`에 등록
3. 공유 타입은 `packages/domain/`에, 공유 UI는 `packages/core-ui/`에 배치
4. 모바일과 API 간 타입은 `packages/api-client/` 또는 `packages/domain/`으로 공유
5. 환경변수 추가 시 `apps/api/src/config.ts`의 Zod 스키마도 함께 업데이트
