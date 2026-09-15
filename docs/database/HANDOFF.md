# Supabase 기본 스키마 / 연결 상태

확인일: 2026-09-15. 대상: **yumidang / fiaxchvyywpqbwbcuzfz**.

## 완료한 범위

실제 프로젝트에 아래 19개 테이블과 외래 키, 중복 방지 제약, 인덱스, 행 단위 접근 제어(RLS)를 적용했다. 카테고리 12개를 넣었으며 실제 회원·업무 데이터는 넣지 않았다.

| 영역 | 테이블 |
| --- | --- |
| 회원 | profiles, private_profiles |
| 탐색·모집 | categories, events, meetup_posts, meetup_post_locations |
| 신청·약속 | join_requests, appointments, schedule_proposals |
| 대화 | chat_rooms, chat_messages |
| 완료·평가 | completion_confirmations, appointment_reviews |
| 관계 | favorite_friends, user_blocks, invitations |
| 알림·신고 | notifications, notification_settings, user_reports |

- [schema.sql](../../supabase/schema.sql): 적용한 초기 스키마 원본. 빈 public 스키마에 한 번 적용하는 SQL이며 기존 프로젝트에 재실행하지 않는다. MCP SQL 트랜잭션으로 적용했으며 CLI 마이그레이션 이력에 등록한 파일은 아니다. 후속 변경은 현재 원격 상태를 기준으로 CLI 마이그레이션을 준비한다.
- [database.ts](../../src/types/database.ts): 실제 원격 DB에서 생성한 TypeScript 타입. 앱 클라이언트 연결은 후속 작업이다.
- [verify.sql](../../supabase/verify.sql): 검증용 SQL. 테스트 회원과 레코드를 생성하므로 반드시 `BEGIN`과 `ROLLBACK` 사이에서 실행한다.

## 권한과 서버 작업 경계

19개 테이블 모두 RLS와 명시적인 테이블·열 권한을 적용했다. 공개 프로필과 회원 개인 정보를 분리하고, 정확한 약속 장소는 작성자 또는 확정·완료 약속의 참여자만 조회한다. 대화는 당사자에게만 공개한다. 즐겨찾기는 저장한 사람만 조회한다.

클라이언트는 본인의 허용된 프로필 필드, 설정, 즐겨찾기, 메시지, 완료 확인, 평가, 알림 읽음, 신고 등을 정책에 따라 처리할 수 있다. 당도·인증·Pro 권한과 후기 공개 시점은 서버가 관리한다. 평가는 자신의 완료 확인과 실제 약속 상대를 요구한다.

모집글·신청·약속·상세 장소·초대·차단·일정 제안의 변경은 현재 서버 쓰기 전용이다. 상태 변경에 따라 여러 테이블을 함께 수정하는 API/RPC는 아직 구현하지 않았다. 후속 서버 구현에서 요청자의 신원·권한과 상태 전이를 검증하고 한 트랜잭션으로 처리해야 한다. service_role 비밀키를 브라우저에 넣지 않는다.

Auth 사용자를 생성할 때 프로필을 자동으로 만드는 트리거도 아직 없다. 가입 시 프로필 생성, 탈퇴 시 익명화·참조 데이터 보존 정책, 후기 쌍방 제출 후 공개 처리는 후속 서버 작업에 포함된다.

## 실제 검증 결과

- 원격 PostgreSQL에서 39개 assertion 통과: RLS, 열 권한, 외래 키, 중복 방지, 시간 조건, 비공개 후기. 테스트용 JWT claims를 설정한 SQL 검증이며 실제 로그인 검증은 아니다. 테스트 데이터는 롤백했다.
- 원격 목록: 테이블 19개, 전부 RLS 활성화. Auth 사용자 0, 프로필 0, 모집글 0, 카테고리 12개.
- 익명 REST 접근 8건 통과: 공개 테이블 5개 HTTP 200, 개인 정보·대화·상세 위치 HTTP 401. `limit=0` 접근 권한 검사이며 행별 검사는 위 SQL로 수행했다. [결과](evidence/rest-access.json).
- 보안 advisor: 지적 사항 없음. 성능 advisor: 데이터가 없는 초기 인덱스의 `unused_index` INFO 32개만 남음. WARN/ERROR 없음.
- 로컬 TypeScript 검사 `npm run lint`, `git diff --check` 통과.
- 앱의 실제 DB 저장, 실제 Supabase 로그인, SMS 발송, 배포 후 통합 검증: 미실행.

## Vercel 연결 상태

**화면 오류 후속 수정: 2026-09-15 15:57 KST.** 아래에서 발견한 `usersAvatar is not defined` 오류와 MyPage 필수 데이터 누락을 수정해 운영 배포에 반영했다. 홈·둘러보기·로그인 이동·시연 계정 Me·새로고침에서 실행 오류 0건을 확인했다. [수정 및 배포 기록](../fixes/users-avatar/HANDOFF.md). DB 업무 데이터 연동은 여전히 별도 작업이다.

**최신 재확인: 2026-09-15 15:48 KST.** 배포 파일이 `/assets/index-BiVhgaEY.js`로 변경됐고 새 프로젝트 `fiaxchvyywpqbwbcuzfz.supabase.co` 주소가 포함돼 있다. 아래 기존 주소 관찰은 이전 배포 기록이다. 새 DB 공개 REST 조회는 HTTP 200, 카테고리 12개 반환. 회원·프로필·모집글·메시지는 각각 0개다.

브라우저로 `/`, `/explore`, `/me`에 접근했으나 세 경로 모두 `usersAvatar is not defined` 실행 오류가 발생했고 Supabase 요청은 관찰되지 않았다. 따라서 주소 설정은 반영됐지만 앱에서 실제 DB 저장이 동작한다고 판정할 수 없다. 로컬 업무 데이터 코드는 여전히 localStorage 프로토타입이며 게시글·채팅용 DB 호출은 없다. [이번 읽기 전용 확인 결과](evidence/deployment-connection-2026-09-15.json).

2026-09-15에 https://yumidang6.vercel.app 의 공개 배포 파일 `/assets/index-h6shi7RG.js`를 조회했다. Supabase 주소는 기존 `hrhudubhmazqevnrfsmo.supabase.co`이며 새 프로젝트 주소는 없었다. 이 관찰은 배포된 파일 기준이며 Vercel 관리자 환경변수 화면은 확인하지 않았다.

로컬 `.env.local`은 새 프로젝트를 가리키지만 Git에 포함되지 않으며 Vercel로 자동 반영되지 않는다. 이번 작업에서 Vercel 환경변수 변경이나 재배포를 수행하지 않았다. 앱의 업무 데이터도 아직 localStorage/예시 데이터를 사용한다.

현재 요청된 테스트 코드 `123456`은 로컬 프로토타입 로그인이다. 실제 Supabase 세션을 발급하지 않으므로 이 로그인만으로 회원 전용 DB 권한을 얻을 수 없다. 실제 DB 연결에는 Supabase 테스트 번호/OTP 등의 실제 세션 발급 설정과 데이터 읽기·쓰기 API 연결이 필요하다. 이후 Vercel 빌드 환경변수 설정, 재배포, 다른 계정 간 접근 차단과 저장·새로고침 검증을 진행한다.
