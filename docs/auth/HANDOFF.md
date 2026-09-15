# Auth / 보호 경로 인수인계

후속 업데이트 (2026-09-15): 아래는 Auth 작업 당시 기록이다. 이후 기본 DB 테이블 19개와 RLS를 적용했으며, 현재 연결 상태와 남은 서버 작업은 [DB 인수인계](../database/HANDOFF.md)를 기준으로 확인한다.

## 구현

- `/`, `/explore`: 공개. `/chat`, `/me`: 로그인 확인. 미로그인 시 `/login?next=...`로 이동한다. `next`는 앱의 네 경로만 허용한다.
- 브라우저 history와 탭을 연결하고 Vercel 직접 경로 진입을 위한 rewrite를 추가했다.
- `VITE_AUTH_MODE=prototype`: 기존 `DemoAuthModal`의 `123456` 예시 흐름을 사용한다. 로그인 상태와 사용자 편집은 기존 앱 localStorage 키에 보존한다. `?demo=1`은 기존 전용 저장소와 체험 도구를 유지한다.
- prototype/demo에서는 Supabase 클라이언트를 생성하지 않고 분석 전송도 차단한다.
- `VITE_AUTH_MODE=supabase`: `signInWithOtp` → `verifyOtp(type: sms)` → `getUser` 검증 후 보호 화면을 연다. 국내 번호를 `+82` 형식으로 정규화하며 재발송 대기, 실패 안내, 번호 변경 시 기존 코드 무효화를 처리한다.
- 세션 복원/변경 시 서버 검증 전 사용자 데이터를 숨긴다. 이전 응답이 로그아웃·계정 전환을 되돌리지 못하게 처리하고 구독/타이머를 정리한다.
- Supabase 모드에서는 localStorage의 예시 사용자로 인증할 수 없다. user_metadata의 당도·인증 배지·Pro 권한을 신뢰하지 않는다.
- 설치된 SDK 2.116.0은 서버 로그아웃 오류가 나도 로컬 세션을 제거할 수 있다. 실제 남은 세션을 확인해 로컬 로그아웃과 서버 종료 미확인을 구분한다.
- 공개 환경변수만 사용하며 하드코딩한 기존 프로젝트 fallback을 제거했다. Supabase 의존성 버전을 2.116.0으로 고정했다.

## 설정

`.env.local`은 Git에서 제외된다. `.env.example`을 참고해 기존 환경변수를 보존하면서 설정한다.

```dotenv
VITE_AUTH_MODE=prototype
VITE_SUPABASE_URL=https://fiaxchvyywpqbwbcuzfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<대시보드의 공개 publishable 키>
VITE_SUPABASE_ANALYTICS_ENABLED=false
```

실제 모드는 `VITE_AUTH_MODE=supabase`로 바꾼 뒤 개발 서버 재시작/재빌드가 필요하다. [Phone provider 설정](https://supabase.com/dashboard/project/fiaxchvyywpqbwbcuzfz/auth/providers)에서 활성화 및 SMS 공급자 또는 테스트 번호 설정이 선행되어야 한다. [공식 휴대폰 Auth 안내](https://supabase.com/docs/guides/auth/phone-login), [관리 API 설정 항목](https://supabase.com/docs/reference/api/v1-update-auth-service-config)을 참고한다.

실제 Supabase 고정 OTP는 `sms_test_otp` 관리자 설정이며 현재 브라우저의 `123456` 기능과 다르다. 현재 MCP에는 Auth 설정 변경 도구가 없고 로컬 관리 토큰도 없어서 설정 변경은 수행하지 않았다. 사용자는 마지막으로 로컬 프로토타입용 테스트 코드를 요청했다.

Vercel 배포는 수행하지 않았다. 향후 프로토타입 배포에는 `VITE_AUTH_MODE=prototype`을 빌드 환경에 명시해야 한다. 모드가 누락되면 Supabase 모드로 동작하며 예시 인증을 허용하지 않는다.

## 현재 관찰 및 검증

- PASS: `npm run lint`, `npm test` 72개, `npm run build`, `git diff --check`.
- PASS: Chromium 브라우저 10개 시나리오. 프로토타입 로그인/가입/새로고침/로그아웃/공개 경로, 가상 Supabase OTP 오류/성공/세션 복원/다른 탭 로그아웃/서버 오류/provider 비활성, demo 격리.
- 빌드 참고: 기존 단일 JavaScript 번들의 500 kB 초과 경고가 남아 있다. 빌드 실패는 아니다.
- OBSERVED_REAL: Supabase 플러그인으로 선택 프로젝트 `ACTIVE_HEALTHY` 확인, SQL 조회에서 `auth.users` 존재 확인, security advisor 반환 `lints: []`.
- OBSERVED_REAL: 공개 Auth settings HTTP 200. `phone=false`, `email=true`, `disable_signup=false`, `phone_autoconfirm=false`, `sms_provider=twilio`. 공급자 표시는 자격증명 설정/문자 발송 성공의 증거가 아니다.
- 실제 사용자 생성, SMS 발송, 실제 세션 발급, DB 업무 데이터 저장, 배포, Gemini 독립 검증: NOT_RUN.
- 테스트 코드와 브라우저 검사: [auth.test.ts](../../tests/auth.test.ts), [check-auth.cjs](../../scripts/check-auth.cjs). 최종 실행 결과는 `evidence/browser.json` 참조.

브라우저 검사는 실제 Chromium을 사용하되 Supabase 응답은 전부 SIMULATED_AUTH다. 로컬 프로토타입 로그인 동작은 실제로 조작했으며 외부 인증 요청 0건을 검사한다.

재실행: 포트 3017에 prototype 모드, 포트 3018에 `VITE_AUTH_MODE=supabase VITE_SUPABASE_URL=https://auth-test.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_test` 모드로 Vite를 실행한 뒤 `node scripts/check-auth.cjs`. 다른 환경은 `CHECK_URL`, `PROTOTYPE_URL`, `PLAYWRIGHT_MODULE`, `BROWSER_EXECUTABLE`로 경로를 지정한다.

## 범위 제한

프론트 경로 보호만으로 서버 데이터가 보호되지는 않는다. 업무 데이터는 아직 localStorage/예시 데이터이며, 실제 DB 연결 시 소유자·참여자 기준 RLS와 API 검증이 필요하다. 이번에는 테이블이나 RLS 정책을 생성하지 않았다. 분석 테이블도 새 프로젝트에서 확인되지 않았으므로 별도 준비 후 명시적으로 활성화한다.
