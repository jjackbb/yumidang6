# Supabase 연결 상태 — 2026-09-15

판정: 서버/API 연결은 살아 있지만, 회원·동행 기능의 실제 저장 연동은 아직이다. GET/HEAD만 사용했으며 DB 쓰기·인증 문자/메일 발송·설정 변경은 하지 않았다.

## 현재 확인한 연결

- 로컬 앱 기본 프로젝트: `hrhudubhmazqevnrfsmo`. 현재 `yumidang6.vercel.app` 배포 번들에서도 같은 프로젝트 URL을 확인했다.
- `src/lib/supabase.ts`에 클라이언트 생성과 공개 anon 키가 있다. 로컬 `.env.local`에는 Supabase 환경변수가 없어서 코드의 기본 URL/키를 사용한다. Vercel 환경변수 목록 자체는 조회하지 않았다.
- 인증 서비스 `/auth/v1/health` 및 `/auth/v1/settings`: HTTP 200.
- 현재 공개 Auth 설정: email=true, phone=false, phone_autoconfirm=false. SMS 발송 성공은 검사하지 않았다.
- `ui_pages`, `ui_back_events`, `user_funnel_events`: HEAD 및 GET(limit=0) HTTP 200. 0건은 요청한 조회 한도이며 테이블이 비어 있다는 뜻이 아니다. API 키 없는 대조 요청은 HTTP 401.
- 전체 REST API 구조 조회(`/rest/v1/`)만 HTTP 401 Invalid API key. 같은 키의 개별 테이블 요청은 200이므로 전체 연결 실패로 단정하지 않는다. 이 오류의 서버 측 원인과 전체 DB 구조는 미확인.

## 코드에서 사용 중인 범위

| 기능 | 현재 구현 |
| --- | --- |
| 기존 인증 세션 복원·변경 감지·로그아웃 | 일반 모드에서 Supabase Auth 호출 |
| 로그인·가입·휴대폰/이메일 확인 화면 | 예시 코드로 동작. signInWithOtp/signUp/verifyOtp 실제 호출 없음 |
| 프로필·공고·신청·채팅·약속·평가·관심친구·초대 | 프론트 공통 상태 및 localStorage. Supabase 업무 데이터 CRUD/Realtime/Storage 호출 없음 |
| 화면 닫기·퍼널 이벤트 | trackBackEvent.ts → ui_back_events, trackFunnelEvent.ts → user_funnel_events에 insert하는 코드 있음. 이번 실제 insert는 미실행 |
| `?demo=1` | 외부 서비스 차단. 세션 복원·인증 리스너·로그아웃·분석 전송을 의도적으로 생략 |
| Codex 관리 도구 | 현재 사용 가능한 도구 및 로컬 MCP 설정에 Supabase 연결 없음 |

서버 접속·개별 테이블 읽기 성공은 실제 회원가입/저장/계정 간 전달/접근 정책의 검증 결과가 아니다. 앱의 예시 로그인 사용자 ID와 Supabase auth.uid는 현재 연결돼 있지 않다.

## 검증 자료

- [읽기 전용 HTTP 검사 결과](supabase-connection-2026-09-15.json)
- [클라이언트 설정](../../src/lib/supabase.ts), [데모 차단](../../src/utils/demoMode.ts), [프로토타입 저장소](../../src/utils/prototypeStore.ts)
- [Supabase API 키와 사용자 인증 구분](https://supabase.com/docs/guides/getting-started/api-keys), [테이블 권한과 RLS](https://supabase.com/docs/guides/api/securing-your-api)

현재 진행 중인 Claude 작업은 승인된 프론트 프로토타입 범위이며, 이 확인으로 실제 DB 연동 범위를 자동 추가하지 않았다.
