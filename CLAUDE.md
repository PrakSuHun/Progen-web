# PROGEN 웹사이트 기획서 (지침서)

> **규칙**: 모든 코드 수정 후에는 반드시 이 문서를 업데이트하고, 다음 작업은 이 문서를 기준으로 시작한다.
> 사용자가 직접 코드를 수정한 경우에도 변경 내용을 알려주면 즉시 이 문서에 반영한다.

> **보고서 작성 시**: `docs/report-general-guide.md` (대외 공개용), `docs/report-podo-guide.md` (내부 포도용) 가이드를 먼저 읽고 작성한다. 생성한 보고서 HTML 백업본은 `docs/reports/` 에 `YYYY-MM-DD_행사명_보고서종류.html`(standalone, Pretendard CDN + 인쇄 스타일 내장)로 저장하고, `reports` 테이블에도 INSERT(`mode`: general/podo)해 `/admin/report?id=` 에서 열람·인쇄.

> **MCP (2026-06-25 신설)**: 프로젝트 루트 `.mcp.json` 에 git·supabase·github·vercel MCP 서버 정의(claude.ai 통합과 무관하게 Claude Code CLI에서 동작, 다른 MCP 클라이언트로 이식 가능). 토큰은 파일에 안 박고 셸 환경변수(`SUPABASE_ACCESS_TOKEN`·`GITHUB_PAT`)로 `${...}` 치환 — 발급/설정은 `docs/mcp-setup.md` 참고. supabase는 `--project-ref=xtbtufdycegfylsoerqq` 스코프(읽기전용 원하면 `--read-only` 추가), git은 uvx, github/vercel은 원격 http 서버.

> **마지막 최신화**: 2026-07-09 (**행사 사전신청 동석자 이름 필드 추가(크루·게스트 공통) + 팀 배정 참고 노출**). 행사가 팀플로 진행되는 경우가 많아 신청 시 **같이 오는 동석자 이름을 선택 입력**받아 팀 배정 참고. ① 마이그레이션 `2026-07-09_registration_companion.sql` — `event_registrations.companion TEXT`(nullable) 신설(라이브 적용). ② `/api/event-reg` POST가 crew/guest 공통으로 `companion` 저장(trim, 빈 값 null). ③ 두 폼(`/event-reg/crew`·`/event-reg/guest`)에 「같은 팀 하고 싶은 분(선택)」 Input + 하늘색 고지 박스(제목 "👥 같은 팀으로 배치해 드려요" + 3줄 불릿: 최대한 같은 팀·구성상 다른 팀 가능·**행사 당일 팀 변경 불가** — 현장 팀 변경 요청 방지 목적). ④ 어드민 노출: `dashboard-data`가 `companion` 반환 + `PersonCard`(Attendee)에 「🤝 팀희망 OOO」 보라 배지 → **팀배정·체크인 탭에서 운영진이 참고**(무조건 같은 팀 보장은 아님). ⑤ **8월 행사명 변경 "여름방학 AI 영상 수익화 클래스"로 전체 통일** — events 라이브 title(377a011e)·program_sessions W6 label(라이브+시드)·홈 `CurriculumSection`/`HeroSection` 8월 카드·`app/seminar` 08 카드 전부 반영. 세미나 페이지 06 이모티콘 종료 처리, **08을 「모집 중」으로 바꿔 사전신청 버튼(→ /event-reg = 8/1) 연결**(종전 06에 붙어 있던 버튼 이동). 크루 지원폼 관심프로젝트 옵션(`lib/constants.ts` PROJECTS)의 'AI 영상·음악 콘텐츠 제작'은 행사명 아님 → 유지. 이전 변경: 2026-07-08 (**공개 행사 플래그(events.is_public) — 행사 신청만 필터, 체크인은 날짜 기반 유지 + 수료관리 남은결석 모수 정정**). ① **`events.is_public BOOLEAN NOT NULL DEFAULT true`** 신설(마이그레이션 `2026-07-08_event_is_public.sql`, 라이브 적용). events가 공개 행사와 하반기 프로젝트 내부 회차(경쟁 PT·매칭데이·수료식 등, `program_sessions.event_id` 연동)를 함께 담게 되면서 웹 사전신청이 가장 가까운 미래 행사(7/18 내부 경쟁 PT)로 잘못 연결되던 문제. **`lib/get-active-event.ts`를 공통 `resolveActiveEventId(publicOnly)`로 리팩터** 후 2갈래: `getActiveEventId()`(날짜 기반·모든 행사, **종전 그대로** — 체크인/피드백/어드민이 씀, 내부 회차도 날짜 되면 현장 체크인·출석 정상 동작) / **`getActivePublicEventId()`(is_public=true만, 신규)** — `/api/event-reg`만 사용해 신청을 공개 행사로만 받음. 내부 회차 5건(7/18·8/21·8/28·9/19·11/7)을 false로, **8/1 "AI로 영상·음악 콘텐츠 제작"만 true** → 웹 사전신청이 8/1로 연결(체크인은 날짜대로 7/18 등도 가능). 어드민 드롭다운엔 false 행사도 계속 노출, 「행사 생성」 신규 행사는 기본 true. ② **수료관리 「남은 결석」 모수 정정** — roster API(`app/api/admin/program/roster/route.ts`)와 출석 매트릭스 탭(`app/admin/program/page.tsx` renderRow)이 결석 모수에 아직 안 열린 예정·날짜미정 회차까지 포함해 `absencesUsed = 전체13 − 출석`으로 계산 → 모두 남은결석 0으로 오표기. **오늘(KST) 이전에 열린 회차(`session_date != null && session_date <= today`)만 모수에 포함**하도록 양쪽 수정. ③ **1기 프로그램 팀모임 주차 마감일 세팅(DB 데이터, 코드 변경 없음)** — W2~W12 팀모임/범위 주차가 `session_date=null`이라 ②의 로직에서 모수 제외돼(특히 W2는 출석 33명 기록됐는데 미집계) 회차별 마감일 부여: W2 7/5(추정)·W3 7/12·W5 7/26·W7 8/9·W8 8/16·W11 9/6·W12 9/13(범위·`~날짜` 주차는 그 주가 끝나는 날 = 마감일로 넣어 주가 완전히 지나야 결석 모수 편입). 날짜 있던 클래스/PT 주차(W1 6/27·W4 7/18·W6 8/1·W9 8/21·W10 8/28·W13 9/19)는 유지. 회차 날짜는 `/admin/program` 회차 편집(sessions PATCH)으로 운영진이 직접 수정 가능. 이전 변경: 2026-06-25 (**분석 탭 차트 드릴다운(세그먼트 명단 팝업)**). 분석 탭의 학교/학년/경로/성별 차트는 카운트만 보여줘서 "충남대 7명"이 누군지 알려면 신청자 탭을 다시 봐야 했음 → **막대/파이 클릭 시 해당 카운트의 실제 인원 명단 팝업**(학교별·학년순 정렬, 이름·🍇·성별·학년·전공·연락처 + 행사모드는 출석상태 배지). 구현: ① `app/api/admin/full-stats/route.ts`의 `section1`에 `people` 배열 추가(카운트와 동일 모집단 — 행사모드=포도 제외 참가자 with `is_crew`, crew-all모드=전체 크루 with `is_member`). 행사모드 registrations select에 `name, major` 추가. ② `app/admin/dashboard/page.tsx`: `MiniBarChart`/`MiniPieChart`에 `onPick` 콜백(Bar/Pie onClick), `SegPerson` 타입, `segment` 상태 + `openSeg(dim, label, target, value)` 헬퍼(target: all/crew/guest/saeng로 모집단 필터 후 dim===value 매칭, 학교→학년(`gradeRank`)→이름 정렬), 차트 config에 `dim` 키, 인라인 팝업(학교 바뀔 때 소제목 헤더). 데스크톱 차트별 target(전체=all/크루=crew/게스트=guest/비포도=saeng), 모바일은 `chartTarget` 사용. **이전 변경: 2026-06-25 (MCP 설정 + 데드 코드 정리)**. ① 프로젝트 루트 `.mcp.json` 신설(git·supabase·github·vercel MCP 서버, claude.ai 통합과 무관하게 Claude Code CLI/다른 MCP 클라이언트에서 동작. 토큰은 셸 환경변수 `${SUPABASE_ACCESS_TOKEN}`·`${GITHUB_PAT}`로 참조 — 비밀값 미커밋. supabase는 `--project-ref=xtbtufdycegfylsoerqq` 스코프. 설정 가이드 `docs/mcp-setup.md`). ② **데드 코드/찌꺼기 제거**(`npm run build` 통과 검증) — 대시보드 페이지가 recharts를 인라인으로 그려 import 안 하던 차트 컴포넌트 9개(`StatCard`/`SchoolChart`/`GradeChart`/`PathChart`/`DateChart`/`FunnelChart`/`FeedbackRadar`/`FeedbackTagChart`/`MembersTable`) + 미사용 `components/feedback/StepIndicator.tsx` 삭제(이제 `components/dashboard/`엔 `EventAlimtalkSettings.tsx`만 남음). 1회용 `fix_metadata.sh`·빈 `content/` 폴더·`.DS_Store`들 삭제. 전 코드에서 사용 0회인 `react-icons` 의존성 제거(`npm uninstall`). 이전 변경: 2026-06-01 (**기수(cohort) + 하반기 프로젝트(수료 관리) 서브시스템 신설** — 행사 독립 운영을 깨지 않고 더하는 additive 변경). 기존 시스템은 행사가 서로 독립이라 여러 회차 누적 출석·수료 판정을 담을 수 없었음. 하반기 13주 프로젝트에 ~30명 크루가 등록해 **개인 출석 3/4(결석 4회까지) + 팀 결과물 기한내 제출 → 수료증** 기준을 관리해야 해서 신규 서브시스템 구축. 청강·게스트는 기존 행사/게스트 모델 유지(수료 무관). 상세는 **14절**. 요약: ① 마이그레이션 `2026-06-01_cohort_program.sql` — `cohorts`(기수) + `events.cohort_id`(1기 백필) + `programs`(룰 설정) + `program_sessions`(13주+OT) + `program_teams` + `program_enrollments`(명단) + `program_attendance`(매트릭스 셀) + `program_projects`/`program_deliverable_specs`/`program_deliverables`(결과물) 9개 테이블, 전부 BIGINT PK·크루 FK BIGINT·RLS 0정책 default-deny. 라이브 DB 적용 완료(1기·1프로그램 시드, events 7건 백필). ② 순수 룰엔진 `lib/program-eligibility.ts`(결석 4 초과→수료취소, 주당1회 cap, 출석 AND 결과물). ③ 체크인 브릿지 `lib/program-checkin-bridge.ts` — 공식행사(`session.event_id` 연동)에 등록 크루가 `/checkin` 시 자동 출석(게스트/청강·미연동 무영향). `app/api/checkin/route.ts` 출석 확정 3지점에 `bridgeProgramAttendance` 1줄씩. ④ 어드민 페이지 `/admin/program`(4탭: 참가자 명단/출석 매트릭스/결과물/팀 관리) + 신규 라우트 `/api/admin/cohorts`·`/api/admin/cohorts/set-current`·`/api/admin/program`(GET/PATCH)·`/program/roster`·`/enroll`·`/enrollment-status`·`/sessions`·`/attendance`·`/attendance-toggle`·`/projects`·`/deliverables`·`/deliverable-toggle`·`/teams`·`/assign-team`. ⑤ 기수 레트로핏: `lib/get-active-cohort.ts`(`getCurrentCohortId`), `/api/admin/events` GET이 `?cohort_id` 필터(없으면 현재 기수, `all`=전체)+`cohorts`/`currentCohortId` 반환·POST는 현재 기수 자동 부착, 대시보드 헤더에 기수 드롭다운(기수 2개+ 시 노출)+「수료관리」링크. ⑥ 1기 13주 일정·프로젝트 3종은 `/admin/program`의 「1기 기본 일정 생성」 버튼 또는 시드로 구성(현재 라이브에 15세션·3프로젝트·5산출물 적재됨). 엔드투엔드 검증 완료(룰엔진 경계값 9/10/8주, 체크인 브릿지 source='checkin', 테스트 데이터 정리). 이전 변경: 2026-06-01 (문서·DB 정합성 점검 — 코드 변경 없음). 라이브 Supabase(`xtbtufdycegfylsoerqq`) 전수 대조 결과 API·알림톡 템플릿·페이지·컴포넌트·출석탭 로직은 코드와 완전 일치. DB 문서 정정 3건: ① 4-3절 — guests의 `project`/`motivation` 제거는 마이그레이션 파일이 아니라 운영 DB에서 **직접** 제거된 것으로 문구 정정(`supabase/migrations/`에 `remove_motivation_project_from_guests.sql` 없음 확인). ② 4-4절 — `event_registrations.crew_id` 타입을 UUID → **BIGINT**로 정정(crew_members.id가 BIGINT라 FK도 BIGINT). ③ `supabase/schema.sql` 을 라이브 DB 기준으로 **전면 재생성**(구버전 스냅샷은 crew_members.id를 UUID로, feedbacks에 score/crew_id/guest_id 존재로, events 5컬럼·auto_checkin·reports·alimtalk_logs 누락, RLS allow-all 정책 등 현실과 어긋났음 → 7개 테이블·실제 컬럼·인덱스·RLS 0정책 default-deny 반영). migrations 폴더가 단일 출처이고 schema.sql은 스냅샷임을 파일 상단에 명시. 이전 변경: 2026-05-20 (출석 탭 알림톡 발송 방식 개편 — 상태 변경은 문자 없이 조용히, 문자는 개별 버튼으로 수동, 현장 체크인 자동문자는 행사별 토글). ① `update-status` 라우트에서 알림톡 자동 발송 **완전 제거**(노쇼확정 전환 시 9·10번 보내던 로직 삭제) — 출석/노쇼/미출석 전환은 이제 문자 없이 처리(사전 불참 통보자도 부담 없이 체크/해제). 단 크루 `noshow_count` 증감은 유지(데이터 정합성). 대시보드 `handleUpdateStatus`의 `window.confirm`·알림톡 토스트도 제거. ② **새 라우트 `POST /api/admin/send-individual-alimtalk`** — 개별 수동 발송. `{registration_id, type:'checkin'|'noshow'}`. `checkin`→6/7번(팀 유무 분기, 크루·게스트 공통), `noshow`→9번(+누적 2회면 10번, 크루 한정). 출석 탭 컬럼별 버튼에서 호출. ③ 출석 탭 UI: **출석완료 컬럼** 카드마다 「출석문자」 버튼(checkin 발송) + 「미출석」, **노쇼확정 컬럼** 카드마다 「노쇼경고」 버튼(crew만 노출) + 「해제」. ④ **현장 체크인(/checkin) 자동 출석문자 토글** — `events.auto_checkin_alimtalk BOOLEAN DEFAULT false`(마이그레이션 `2026-05-20_auto_checkin_alimtalk.sql`) 신설. `/checkin`의 `sendCheckinAlimtalk`가 발송 전 활성 행사의 이 플래그를 조회해 **true일 때만 자동 발송**(기본 OFF=발송 스킵). 출석 탭 「출석완료」 헤더에 `자동문자 ON/OFF` 토글 버튼 — **활성 행사(`selectedEventId === activeEventId`) 선택 시에만 노출**(현장 체크인은 활성 행사만 처리하므로). **새 라우트 `POST /api/admin/toggle-auto-checkin`**(`{eventId, enabled}`)로 저장. `/api/admin/events` GET이 `auto_checkin_alimtalk` 반환 + 대시보드가 `activeEventId` state 보관. 이전 변경: 2026-05-21 (events DB만 수정: 2026-05-30 행사명 `PROGEN 1기 OT - 청년마을 만들기 협업 프로젝트` → `'청년마을 만들기' X PROGEN 실전 프로젝트 OT`, 시작시각 14:00 → 15:00 KST(event_date=`2026-05-30 06:00:00+00`). 행사는 15:00~16:30 진행이나 events 테이블에 종료시간 컬럼 없어 시작시각만 반영. 코드 변경 없음. 이전 변경: 2026-05-15 ① 신청자 탭 새로고침 버튼을 「+ 크루 추가」로 교체(상단 헤더에 새로고침 별도 존재) + 새 라우트 `POST /api/admin/add-registration`(eventId·crewId → event_registrations에 사전신청 INSERT + 행사정보 ready 시 2번 크루용 확정 알림톡 자동 발송) + `app/admin/dashboard/page.tsx`에 `AddCrewModal` 신설(크루 명단 검색·선택·추가, 이미 신청된 크루 제외, 이름 가나다순). 행사 신청자 모드(`membersMode === 'event'`)에서만 노출, crew-all 모드 제외. ② 어드민 "설정" → "알림톡 발송" 탭 미발송자 명단 가나다 정렬(이름 빨리 찾기 위함, `event-settings` GET에서 `localeCompare(name, 'ko')`로 정렬). ③ 어드민 "설정" → "알림톡 발송" 탭에 미발송자 체크박스 명단 추가 — 참석확정(2번)·D-1 공지(4번)에 대해 미발송 대상 명단을 표시하고 운영진이 일부만 골라 발송 가능. `GET /api/admin/event-settings`가 `recipients.confirm/d1` (각 `{id, name, type: 'crew'|'guest', sent}`) 반환 + confirm sent 카운트가 크루용(`EVENT_CONFIRMED_CREW.code`)/게스트용(`EVENT_CONFIRMED.code`) 템플릿 분리되어 정확히 집계되도록 수정. `POST /api/admin/send-alimtalk-batch`에 선택적 `registrationIds: string[]` 필터 옵션 — 있으면 그 ID만, 비우면 기존처럼 미발송자 전원. `components/dashboard/EventAlimtalkSettings.tsx`에 `RecipientChecklist` 추가(미발송자 체크박스, 발송완료자 회색 line-through, 크루/게스트 배지). 일정/장소 변경(8번)은 그대로 전원 발송. 이전 변경: 2026-05-13 참석 확정(2번) 알림톡을 크루용/게스트용 2종으로 분리 — `lib/solapi.ts`의 `ALIMTALK`에 `EVENT_CONFIRMED_CREW`(`KA01TP260512222214758QYG80poi9FS`, 보증금 문구 없음) 신설 + 기존 `EVENT_CONFIRMED`는 게스트 전용으로 라벨 변경. `/api/event-reg` mode=crew는 새 크루용으로, `/api/admin/toggle-deposit`은 그대로 게스트용. `/api/admin/send-alimtalk-batch` template=confirm은 대상이 크루(crew_id 존재)면 크루용, 아니면 게스트용으로 row별 분기 발송. dedup도 template_code 기준이라 자연스럽게 분리됨. → 6번 표 / 이전 변경: 2026-05-11 ① 카카오 알림톡(솔라피) 시스템: 템플릿 10종 + lib/solapi.ts + events 행사정보 5컬럼 + alimtalk_logs 테이블 + 어드민 "설정" 모달 + 보증금 탭 「취소 알림」 버튼 + 7개 라우트 발송 연결. ② 3·4·5월 행사명 변경(events 테이블 + 홈/세미나/아카이브), 2026-05-30 "PROGEN 1기 OT" events row 추가. ③ 팀배정 탭 정렬 버튼. ④ 모바일 가로 스크롤·blur blob 수정. ⑤ 데드 코드 정리: StarField/AboutSection/NumbersSection/ActivitiesSection/StarRating/getLatestEventId/dashboard·full/SCORE_LABELS/supabase-browser.ts 삭제 + next-mdx-remote·gray-matter 의존성 제거 + 잔존 파일(standalone HTML, 크루명단 xlsx) 삭제. ⑥ 알림톡 `#{프로그램명}` 변수를 `lib/solapi.ts`의 `programLabel()`로 낫표(`「행사명」`)로 감싸 행사명 강조 — solapi.ts의 `vars*` 5종 + send-cancel-alimtalk/update-status/send-alimtalk-batch 라우트 모두 적용. ⑦ `lib/solapi.ts`의 `ALIMTALK` 맵 templateId 10종을 솔라피 실제 ID(`KA01TP260511...`)로 교체(이전엔 placeholder). 솔라피 채널 `KA01PF260511054914846rCGGdEqH9tS`(searchId `progen`). 10종 중 #5(신청 취소 확인)만 검수 승인(APPROVED), 나머지 9종은 검수중(INSPECTING) — ID 맞아도 검수 통과 전엔 발송 안 됨. → 6번·12번 표 참고. ⑧ 홈 `CurriculumSection` 카드 제목 레이아웃 변경: `headline`(키워드)을 작은 폰트(`text-[11px] md:text-xs`)·sky-500 라벨로 제목 윗줄에 분리, `title`(행사명)은 큰 굵은 글씨(`text-lg md:text-2xl font-black`)로 강조. 종료 회차는 키워드 `#aaa`/제목 `#888`.)

---

## 1. 프로젝트 개요

**PROGEN**은 대전 소재 대학생을 대상으로 한 AI·자동화 커뮤니티 운영 플랫폼이다.
1기 크루 모집부터 행사 관리, 피드백 수집, 관리자 분석까지 모든 운영을 한 곳에서 처리한다.

- **프로젝트 이름**: PROGEN
- **배포 URL**: https://progen.ai.kr
- **대상**: 대전 소재 대학생 (충남대, 한남대, 배재대, KAIST 등 7개 학교)
- **1기 일정**: 4월 ~ 7월, 월 1회, 핵심 압축 클래스
- **참가비**: 무료

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, Next.js 15 (App Router), TypeScript |
| 스타일 | Tailwind CSS (라이트 테마: 흰 배경 + sky-500 포인트) |
| 폰트 | Pretendard (CDN) |
| Backend | Next.js API Routes (서버리스) |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 배포 | Vercel |
| 차트 | Recharts |

---

## 3. 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon 키
SUPABASE_SERVICE_ROLE_KEY=        # Supabase 서비스 롤 키 (서버 전용)
ADMIN_PASSWORD=                   # 관리자 로그인 비밀번호
SOLAPI_API_KEY=                   # 솔라피 API Key (알림톡 발송, 서버 전용)
SOLAPI_API_SECRET=                # 솔라피 API Secret (서버 전용)
SOLAPI_PFID=                      # 솔라피 카카오 발신프로필 키(pfId)
SOLAPI_SENDER_PHONE=              # 솔라피 등록 발신번호 (실패 시 대비. 숫자만)
```

> **알림톡 환경변수가 비어 있으면** `lib/solapi.ts`의 `sendAlimtalk()`은 조용히 skip(발송 안 함) — 사이트 동작은 안 막힘. 카카오 검수 통과 + Vercel/`.env.local` 양쪽에 4개 다 채워야 실제 발송됨. 솔라피 API Key는 Vercel 서버리스 outbound IP가 고정이 아니므로 IP 제한 없이("모든 IP 허용") 발급.

> **활성 행사 결정**: `lib/get-active-event.ts`의 `getActiveEventId()`가 자동 처리.
> 오늘 자정 이후 가장 가까운 행사를 자동 선택. 모든 행사가 지났으면 가장 최근 행사 반환.

### 1기 커리큘럼 (홈페이지 노출 5개월, 종료 회차 포함)
| 월 | 주제 (홈 카드 title) | 헤드라인 | 상태 |
|----|------|----------|------|
| 03 | AI 시대 대학생으로 살아남기 | 대학생 실전 활용 | 종료 (80명) |
| 04 | AI로 완성하는 가성비 벼락치기 클래스 | 중간고사 집중 대비 | 종료 (40명) |
| 05 | 클로드 AI 실전 클래스 | 시간을 돌려받는 | 종료 |
| 06 | AI로 만드는 카카오 이모티콘 클래스 | 기획부터 굿즈까지 | 종료 (6/27 토) |
| 08 | 여름방학 AI 영상 수익화 클래스 | 온라인 수익화 | 모집 중 (8/1 토, 사전신청 OPEN) |

> 종료 회차는 회색 월 박스 + opacity-75 + 회색 highlight 박스로 시각 구분 (홈/세미나 동일 스타일).
> 위 5개는 홈 커리큘럼·세미나의 하드코딩 copy. **`events` 테이블의 `title`도 동일하게 맞춤** (라이브 8/1 = `여름방학 AI 영상 수익화 클래스`, 2026-07-09 변경). events엔 하반기 프로젝트 내부 회차(경쟁 PT·매칭데이 등)도 함께 있으며 `is_public=false`라 홈/세미나엔 노출 안 됨.
> **추가 events row**: 2026-05-30 `'청년마을 만들기' X PROGEN 실전 프로젝트 OT` (is_mandatory=true). 15:00~16:30 KST (event_date=15:00 KST; events 테이블엔 종료시간 컬럼 없음). 홈/세미나 하드코딩엔 없음 — events 테이블·어드민·알림톡에서만 노출. 5/16 행사가 지나면 `getActiveEventId()`가 이 OT를 활성 행사로 잡음.

---

## 4. 데이터베이스 구조 (Supabase)

### 4-1. events (행사)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| title | TEXT | 행사 이름 |
| event_date | TIMESTAMPTZ | 행사 일시 |
| is_mandatory | BOOLEAN | 필수 참석 여부 |
| location | TEXT (nullable) | 장소 — 알림톡 `#{장소}`. 어드민 "설정" 모달에서 입력 |
| entry_time | TEXT (nullable) | 입장 시간 — 알림톡 `#{입장시간}` (예: "오후 1시 30분") |
| materials | TEXT (nullable) | 준비물 — 알림톡 `#{준비물}` |
| program_detail | TEXT (nullable) | 당일 진행 — 알림톡 `#{진행내용}` |
| kakao_chat_url | TEXT (nullable) | 회차 참여자 채팅방 버튼 링크 |
| auto_checkin_alimtalk | BOOLEAN (NOT NULL, default false) | 현장 체크인(/checkin) 자동 출석문자(6/7번) 발송 토글. **활성 행사에서 true일 때만** 체크인 시 자동 발송. 마이그레이션 `2026-05-20_auto_checkin_alimtalk.sql` |
| is_public | BOOLEAN (NOT NULL, default true) | 웹 **행사 사전신청(`/event-reg`)** 공개 대상 여부. **`getActivePublicEventId()`(신청 전용)만 is_public=true로 필터** — 내부 프로젝트 회차(경쟁 PT·매칭데이·수료식 등)를 false로 두면 웹 신청이 그 회차로 잘못 연결되지 않음. **체크인(`/checkin`)·피드백·어드민은 종전대로 날짜 기반 `getActiveEventId()`(모든 행사)** — 내부 회차도 날짜가 되면 현장 체크인/출석 정상 동작. 어드민 드롭다운엔 false 행사도 계속 노출. 신규 행사(어드민 「행사 생성」)는 기본 true. 마이그레이션 `2026-07-08_event_is_public.sql`. 현재 false: 7/18 경쟁PT·8/21 매칭데이·8/28 웹교육·9/19 최종PT·11/7 수료식 (프로그램 내부 회차, `program_sessions.event_id` 연동) |
| created_at | TIMESTAMPTZ | 생성일 |

> `location`~`kakao_chat_url` 5개는 2026-05-11 마이그레이션(`event_alimtalk_fields`)으로 추가. 비어 있으면 알림톡 발송 시 "추후 안내"/"채팅방 공지 참고" fallback. **5개가 모두 채워져야** 참석 확정(2번) 알림톡이 자동 발송됨(`eventConfirmReady`); 그 전까지는 보류 → 어드민 "설정" → "알림톡 발송" 탭에서 미발송자 일괄 발송.

### 4-2. crew_members (크루 지원자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | BIGINT (PK) | 자동 생성 (※ guests/events와 달리 UUID 아님) |
| name | TEXT | 이름 |
| phone | TEXT (UNIQUE) | 연락처 (고유 식별자) |
| school | TEXT | 학교 |
| grade | TEXT | 학년 |
| age | TEXT | 나이 |
| major | TEXT | 전공 |
| path | TEXT | 알게 된 경로 |
| project | TEXT | 관심 프로젝트 |
| gender | TEXT | 성별 |
| motivation | TEXT | 지원 동기 |
| history | TEXT | (잔존 컬럼, 코드 미사용 / 79명 중 0명 채워짐) |
| role | TEXT | 'participant' 또는 'staff' |
| status | TEXT | '지원완료' (기본값) |
| is_member | BOOLEAN | true=포도, false/null=일반 (내부 전용) |
| noshow_count | INT | 누적 노쇼 횟수 (기본값 0) |
| source_event_id | UUID (nullable) | 게스트→크루 전환 시 최초 유입 행사 |
| created_at | TIMESTAMPTZ | 지원일 |

> **포도 감지**: `is_member=true` 또는 phone이 `PODO-`로 시작하는 경우.
> **노쇼 박탈 기준**: noshow_count ≥ 2.
> **표기**: 포도는 화면에 이름 옆 🍇 또는 보라색 점 표시.

### 4-3. guests (게스트)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| name | TEXT (NOT NULL) | 이름 |
| phone | TEXT (NOT NULL, UNIQUE) | 연락처 |
| age | TEXT | 나이 |
| school | TEXT | 학교 |
| grade | TEXT | 학년 |
| major | TEXT | 전공 |
| path | TEXT | 알게 된 경로 |
| gender | TEXT | 성별 |
| source_event_id | UUID (nullable) | 최초 유입 행사 |
| created_at | TIMESTAMPTZ | 등록일 |

> ⚠️ `project`, `motivation` 컬럼은 2026-04-02 운영 DB(Supabase 대시보드)에서 **직접 제거**됨 — `supabase/migrations/`에 해당 마이그레이션 파일은 없음(2026-06-01 라이브 DB 확인). 코드 어디서도 참조 금지. (crew_members 에는 두 컬럼이 그대로 남아 있음 — 4-2 참고)

> **유입 추적**: 게스트가 크루로 전환되면 동일 phone으로 crew_members 생성하면서 기존 행사 신청·피드백을 새 crew_id로 마이그레이션 (`/api/apply` 내부 로직).

### 4-4. event_registrations (행사 신청/출석)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 어느 행사인지 |
| crew_id | BIGINT (FK → crew_members) | 크루면 연결 (※ crew_members.id 가 BIGINT라 UUID 아님) |
| guest_id | UUID (FK → guests) | 게스트면 연결 |
| status | TEXT | '사전신청' / '출석완료' / '노쇼확정' |
| team_name | TEXT | 팀 배정명 (예: '1팀', null=미배정) |
| checked_in_at | TIMESTAMPTZ | 출석 시각 |
| deposit_status | TEXT | '미입금' / '입금' / '환불' (게스트 한정 의미, 기본 '미입금') |
| deposit_paid_at | TIMESTAMPTZ | 마지막 상태 변경 시각 |
| refund_account | TEXT | 게스트 환불 계좌 (예: "하나은행 110-123-456789") |
| companion | TEXT (nullable) | 같은 팀 희망 인원("같은 팀 하고 싶은 분") 이름. 크루·게스트 폼 공통 선택 입력, 자유 텍스트(여러 명은 쉼표 등 신청자 자율). **팀 배정 시 운영진 참고용** — 어드민 팀배정·체크인 탭 `PersonCard`에 「🤝 팀희망 OOO」 배지로 노출(`dashboard-data`가 반환). 무조건 같은 팀 보장 X·행사 당일 팀 변경 불가는 폼에서 고지. 마이그레이션 `2026-07-09_registration_companion.sql` |
| registered_at | TIMESTAMPTZ | 신청일 (※ 다른 테이블의 created_at 컨벤션과 다름) |

> crew_id와 guest_id 중 하나만 값이 있다.
> `deposit_status`: 비회원(게스트) 사전 신청 시 노쇼 방지 보증금 5,000원 + 참석 시 환불 정산 트래킹용. 운영진 어드민 보증금 탭에서 클릭마다 미입금 → 입금 → 환불 → 미입금 순환.
> 마이그레이션: [supabase/migrations/2026-05-06_deposit_status_refund_account.sql](supabase/migrations/2026-05-06_deposit_status_refund_account.sql) — `deposit_paid` BOOLEAN을 `deposit_status` TEXT로 교체 + `refund_account` 추가.
> `refund_account`: 게스트 신청 폼에서 은행/계좌번호 2개로 받아 공백 구분 단일 텍스트로 저장. 어드민 보증금 탭에서 누락된 계좌 직접 입력·수정 가능.
> 과거(2026-04-26) 마이그레이션: [supabase/migrations/2026-04-26_deposit_paid.sql](supabase/migrations/2026-04-26_deposit_paid.sql) (BOOLEAN 시절).

### 4-5. feedbacks (피드백, 익명)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 어느 행사인지 |
| good_tags | TEXT[] | 좋았던 점 태그 (선택) |
| good_points | TEXT | 좋았던 점 자유 의견 (필수) |
| bad_tags | TEXT[] | 아쉬운 점 태그 (선택) |
| bad_points | TEXT | 아쉬운 점 자유 의견 (필수) |
| would_return | BOOLEAN | 다음에도 참여 의향 |
| join_interest | BOOLEAN | PROGEN 가입 관심 |
| created_at | TIMESTAMPTZ | 제출일 |

> **익명 제출**: crew_id, guest_id, score 없음.

### 4-6. reports (AI 보고서)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 대상 행사 |
| title | TEXT | 보고서 제목 |
| mode | TEXT | 'general' (기본) / 'podo' |
| content | TEXT | HTML 본문 |
| created_at | TIMESTAMPTZ | 생성일 |

> 외부 AI(Claude 등)가 생성한 결과를 저장. `/admin/report?id=xxx`로 단일 페이지 뷰 + 인쇄.

### 4-7. alimtalk_logs (알림톡 발송 로그, 2026-05-11 신설)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| template_code | TEXT | 솔라피 카카오 템플릿 ID (예: 'KA01TP260511072253259HLsKXmMYVoG') |
| template_name | TEXT | 사람이 읽는 이름 (예: '행사 신청 접수') |
| to_phone | TEXT | 수신 번호 (숫자만) |
| crew_id | BIGINT (FK → crew_members, ON DELETE SET NULL) | 크루 대상이면 |
| guest_id | UUID (FK → guests, ON DELETE SET NULL) | 게스트 대상이면 |
| registration_id | UUID (FK → event_registrations, ON DELETE SET NULL) | 행사 신청 건이면 |
| event_id | UUID (FK → events, ON DELETE SET NULL) | 어느 행사 |
| status | TEXT | 'sent' / 'failed' |
| solapi_message_id | TEXT | 솔라피 응답 messageId |
| error | TEXT | 실패 사유 |
| variables | JSONB | 발송에 쓴 치환 변수 스냅샷 |
| created_at | TIMESTAMPTZ | 발송 시각 |

> 알림톡 1건 보낼 때마다 `sendAlimtalk()`이 1행 기록. "미발송자 = 해당 행사·템플릿(template_code)에 대해 status='sent' 로그가 없는 사람" 으로 일괄 발송 대상 판단. RLS 활성화 + 정책 0개(anon default-deny). 마이그레이션: `2026-05-11_alimtalk_logs.sql`.

---

## 5. 페이지 구조 및 로직

### 5-1. 홈 `/` ([app/page.tsx](app/page.tsx))
**구성 섹션** (현재 4개):
1. `HeroSection` — 풀스크린 히어로 (좌: 메인 카피·CTA, 우: 떠다니는 행사 미리보기 카드 4장 lg+에서만)
2. `CurriculumSection` — 커리큘럼 카드 (03·04·05·06 종료, **08 "여름방학 AI 영상 수익화 클래스" 모집중=8/1(토) 사전신청 OPEN**). 06 카카오 이모티콘 종료 처리, 08을 신청 OPEN으로. HeroSection 상단 배지도 "8월 클래스 사전 신청 OPEN", 우측 FloatCard 4장은 3·4·6월 종료 + 8월 모집중(highlight)
3. `ReviewsSection` — 참가자 후기 3개 (5성 + 인용문 + 아바타)
4. `CtaBanner` — 크루 혜택 4개 카드 + 진입장벽 해소 2개 박스 + 보라색 CTA 섹션

**HeroSection 세부 (2026-04-26 업데이트)**:
- 배경: 마우스 추적 spotlight (`--mx`/`--my` CSS 변수, useEffect로 mousemove 갱신) + 흰→연보라 그라데이션
- dot grid 패턴 오버레이 (.bg-dot-grid, opacity-50)
- mesh blob 3개 (violet/fuchsia/sky), 각각 다른 키프레임/딜레이로 비동기 부유
- 상단 그라데이션 라인
- 배지: 펄스 + ping 애니메이션 (이중 ring 효과)
- 타이틀 "도구를 지배하는" 부분에 violet→fuchsia 그라데이션 + gradientShift 애니메이션
- CTA primary: violet→fuchsia 그라데이션, hover 시 색 반전 + lift
- 우측 FloatCard 4장 — 3월/4월/5월/6월 행사 미리보기, 각각 회전·딜레이 다른 float 애니메이션 (모바일 hidden, lg+ 표시)
- 5월 카드는 highlight 옵션 (violet ring + 펄스 점)
- 하단 "Scroll" 인디케이터 + 페이드 라인

> **테마**: 흰 배경, 섹션별 `#fafafa`와 흰색 교차. 보라 포인트 `sky-500`. 히어로만 그라데이션 + spotlight.

---

### 5-2. 소개 `/about` ([app/about/page.tsx](app/about/page.tsx))
- 히어로 ("왜 PROGEN을 만들었는가")
- 철학 3개 가치 카드: "실행 > 이론", "도구 활용 = 생존력", "함께 > 혼자"
- 창립자 박수훈 소개 (아바타 + 6개 태그 + 인용문 + 통계 4개: 1.5억 매출, 1.2억 지원금 등)
- CTA → /apply

---

### 5-3. 크루 지원 `/apply` ([app/apply/page.tsx](app/apply/page.tsx))
**입력 필드 (10개)**: 이름, 성별, 연락처(자동 포맷), 나이, 학교, 학년, 전공, 경로, 관심프로젝트, 지원동기.

**처리**:
1. `POST /api/apply` 호출
2. phone으로 crew_members 중복 확인 → 있으면 409
3. 신규 삽입 (role='participant', status='지원완료')
4. **게스트→크루 전환**: 같은 phone의 guests가 있으면 그 게스트의 `event_registrations`/`feedbacks`를 새 crew_id로 마이그레이션
5. 성공 → 완료 모달 (카카오톡 팀 채팅방: https://invite.kakao.com/tc/Y2VGimsEqA) → 닫으면 홈으로
6. 중복(409) → 중앙 모달 (문의: https://open.kakao.com/o/sQqCopki)

---

### 5-4. 행사 사전 신청 (3개 페이지로 분리, 2026-05-01)
- **`/event-reg`** ([app/event-reg/page.tsx](app/event-reg/page.tsx)) — 랜딩. 두 카드(크루 / 비회원)로 분기.
- **`/event-reg/crew`** ([app/event-reg/crew/page.tsx](app/event-reg/crew/page.tsx)) — 크루 폼. **이름 + 연락처 + 같은 팀 하고 싶은 분(선택, 3개)**.
- **`/event-reg/guest`** ([app/event-reg/guest/page.tsx](app/event-reg/guest/page.tsx)) — 비회원 폼 (11개: 기본 8개 + 같은 팀 하고 싶은 분(선택) + 환불 은행 + 환불 계좌번호) + 보증금 5,000원 안내. 환불 계좌는 폼에서 2개 필드로 받아 `${bank} ${account}` 공백 구분 단일 텍스트로 `event_registrations.refund_account`에 저장 (게스트 단위 영속 저장 X — 일회성 행사마다 재입력).

> **같은 팀 하고 싶은 분(2026-07-09, 두 폼 공통)**: 행사가 팀플로 진행되는 경우가 많아 같은 팀 희망 인원을 선택 입력받아 `event_registrations.companion`에 저장 → 팀 배정 시 참고(어드민 팀배정·체크인 탭 `PersonCard`에 「🤝 팀희망 OOO」 배지). 라벨 "같은 팀 하고 싶은 분(선택)"·placeholder "예) 김철수, 이영희". 필드 아래 하늘색 고지 박스(제목 + 3줄 불릿): 최대한 같은 팀·구성상 다른 팀 가능·행사 당일 팀 변경 불가. 무검증(선택). `/api/event-reg`가 crew/guest 공통으로 `companion` 저장.

**처리**:
- 크루: `crew_members`에서 `name+phone` 매칭 → 없으면 404 (이전: 토스트 → 현재: 모달 + 크루지원/비회원신청 안내)
- 게스트: `guests`에 phone 기준 upsert (신규면 source_event_id 설정)
- 공통: `event_registrations`에 `status='사전신청'` 삽입
- 중복 → 409, 중앙 Modal (문의: https://open.kakao.com/o/sQqCopki)

**보증금 안내 (게스트 한정)**:
- 폼 위 노란색 안내 박스: 5,000원 보증금, 참석 시 전액 환불
- 신청 완료 모달: 입금 계좌(하나은행 660-910011-22904 / 예금주: 프로젠(ProGen)) + 계좌번호 복사 버튼 + 오픈채팅 문의
- 운영진은 어드민 대시보드 체크인 탭에서 게스트 카드의 "보증금 ✓ 입금 / ✗ 미입금" 뱃지 클릭으로 토글

**테스트 단축키 (이름으로 모달만 미리보기, DB 미기록)**:
- `테스트` → 신청 완료 모달
- `테스트1` → 이미 신청 모달
- `테스트2` → 크루 정보 없음 모달 (크루 폼만)

**연락처 검증**: 정확히 11자리 숫자만 통과 ([lib/constants.ts](lib/constants.ts)의 `isValidPhone`).
**나이 라벨**: "나이 *2007년생 기준 20살" 회색 주석 표시.

---

### 5-5. 현장 출석체크 `/checkin` ([app/checkin/page.tsx](app/checkin/page.tsx))
**경로 A — 사전 신청자 출석** (2026-05-01 보안 강화):
1. 이름 + 연락처 입력
2. `POST /api/checkin` (walkin: false)
3. **`phone + name` AND 매칭** (이전: phone-only)으로 본인 확인 강도 ↑. 공백/오타에 강하도록 normalize.
4. 활성 행사의 `event_registrations` status='출석완료' + checked_in_at으로 UPDATE
5. 이미 출석완료 상태면 409 + "이미 출석하셨어요" 모달 (이전: 200 silent)
6. 응답에 `team_name` 포함 → "OOO님 출석 완료, X팀입니다" Modal
7. **출석문자(6/7번) 자동 발송은 활성 행사 `events.auto_checkin_alimtalk = true`일 때만** (2026-05-20). 기본 OFF → 체크인해도 문자 안 나감. `sendCheckinAlimtalk`가 발송 직전 플래그 조회 후 false면 skip. 운영진은 어드민 출석 탭 「출석완료」 헤더의 `자동문자 ON/OFF` 토글로 켜고, 끈 상태에선 신청자 탭 개별 「출석문자」 버튼으로 수동 발송.

**경로 B — Walk-in** (2026-05-01 안전성 개선):
- 사전 신청 404 시 자동으로 walk-in 폼 표시 (8개 필드)
- 크루 매칭은 **phone 단독** (이전: name+phone, 오타 시 게스트 중복 생성됨)
- INSERT 전 **기존 사전 신청 row 확인 → 있으면 UPDATE**로 전환 (이전: 무조건 INSERT → 유니크 위반 → 출석 누락 사고)
- 응답의 name은 DB 저장값 사용 (사용자 입력 오타 무시)

**테스트 단축키 (DB 미기록)**:
- `테스트` → 출석 완료 모달 (1팀 표시)
- `테스트1` → 이미 출석 모달

> **QR**: `/checkin` URL을 외부 QR 도구로 인쇄해 현장 비치.

---

### 5-6. 행사 피드백 `/feedback` ([app/feedback/page.tsx](app/feedback/page.tsx))
**5단계** (Step 0~4):
| 단계 | 내용 | 필수 |
|------|------|------|
| 0 | 시작 화면 | - |
| 1 | 좋았던 점 (태그 + 텍스트) | 텍스트 필수 |
| 2 | 아쉬운 점 (태그 + 텍스트) | 텍스트 필수 |
| 3 | 재참여 의향 + 가입 관심 (체크박스) | 선택 |
| 4 | 완료 화면 (`join_interest=true`이면 /apply 버튼) | - |

**처리**: `POST /api/feedback` → 활성 행사의 feedbacks에 익명 삽입.

> **QR**: `/feedback` URL을 인쇄해 행사 종료 시 배포.

---

### 5-7. 세미나 `/seminar` ([app/seminar/page.tsx](app/seminar/page.tsx))
정적 데이터 (페이지 내 상수 `seminars` 5개):
- 03(종료) AI 시대 대학생으로 살아남기 — 정원 80, 활동: 자료 서치 / 논문 파악 / PPT 제작 / 보고서 제작
- 04(종료) 중간고사 집중 대비 — AI로 완성하는 가성비 벼락치기 클래스 — 참가 40명, 활동: 수업 녹음 / 시험 키워드 분석 / 시험 문제 제작 / 벼락치기 요약본
- 05(종료) 시간을 돌려받는 — 클로드 AI 실전 클래스
- 06(종료) AI로 만드는 카카오 이모티콘 클래스
- 08(모집 중) 여름방학 AI 영상 수익화 클래스 — 8/1(토), 사전신청 버튼 → /event-reg (8/1 행사로 연결)
카드별: 월 박스 + 상태 배지 + 제목 + 설명 + 메타 + 태그 + 조건부 사전신청 버튼 (모집중일 때만 → /event-reg).
종료 카드는 opacity-75 + 회색 월 박스로 시각적 구분.

> **활동 중심 설명 정책**: 사용한 AI 툴 이름(다글로/NotebookLM/Scispace 등)은 영업비밀 차원에서 **외부 페이지(세미나·아카이브)에 노출하지 않는다**. 어떤 작업을 하는지(활동) 만 표기.
robots: noindex.

---

### 5-8. 아카이브 `/archive` ([app/archive/page.tsx](app/archive/page.tsx))
정적 데이터 (`events: ArchiveEvent[]`, 현재 2건):
- **2026-04-11 AI로 완성하는 가성비 벼락치기 클래스** (참가자 40명, 충남대) — 활동: 수업 녹음 / 시험 키워드 분석 / 시험 문제 제작 / 벼락치기 요약본. 사진 2장 (`/archive/0411-1.jpeg`, `/archive/0411-2.jpeg`).
- **2026-03-28 AI 시대 대학생으로 살아남기** (참가자 80명+, 충남대) — 활동: 자료 서치 / 논문 파악 / PPT 제작 / 보고서 제작 / 팀 실습. 사진 2장 (`/archive/0328-1.JPG`, `/archive/0328-2.JPG`).

각 카드: 사진 그리드(있을 때만, hover scale-105) + 태그 + 제목 + 메타(날짜·장소·참여자) + 설명 + highlights 박스들.
하단: 보라색 안내 박스("더 많은 이야기가 쌓이고 있어요").

> **활동 중심 설명 정책 동일**: 사용한 AI 툴 이름은 노출 금지. 활동만 표기 (세미나 페이지와 통일).
> 사진 있는 행사만 photo grid 렌더, 없으면 정보 카드만 표시 (4월 행사 등).
robots: noindex.

---

### 5-9. 커뮤니티 `/community` ([app/community/page.tsx](app/community/page.tsx))
UI만, 실제 기능 없음. 4개 채널 카드 + 5개 크루 혜택 + 보라 CTA 배너 → /apply.
robots: noindex.

---

### 5-10. 운영진 모집 `/recruit` ([app/recruit/page.tsx](app/recruit/page.tsx))
정적 안내. 3개 포지션(기획/테크/마케팅, 좌:업무·우:자격) + 4개 혜택 + CTA → /apply.
robots: noindex.

---

### 5-11. 정적 페이지 (public/)
별도 라우트 없이 정적 HTML로 서빙.

| 경로 | 용도 |
|------|------|
| `/ai_study/` | AI 스터디 가이드 (data.json + 1058개 candidates 폴더 + 30개 이미지) |
| `/planner-guide/` | 플래너 가이드 (단일 5MB HTML) |
| `/guide329/` | 3월 29일 행사 가이드 (HTML + slides26 18개 슬라이드) |

> 모두 `app/` 라우트가 아닌 `public/` 정적 자산. Next.js 라우터 미경유.

---

### 5-12. 관리자 로그인 `/admin` ([app/admin/page.tsx](app/admin/page.tsx))
비밀번호 입력 → `POST /api/admin/login` → 일치 시 `admin_session=authenticated` httpOnly 쿠키 (30일) → `/admin/dashboard`로 이동.

---

### 5-13. 관리자 대시보드 `/admin/dashboard` ([app/admin/dashboard/page.tsx](app/admin/dashboard/page.tsx))

**보증금 3-상태 관리 (2026-05-06 갱신)**: 체크인 탭 게스트 카드 뱃지 / 보증금 탭 행 / 분석 탭 게스트 섹션 모두 3-상태 표시 (미입금=amber, 입금=emerald, 환불=sky). 클릭마다 [/api/admin/toggle-deposit](app/api/admin/toggle-deposit/route.ts)이 미입금 → 입금 → 환불 → 미입금 사이클로 변경 (서버에서 현재 값을 읽어 다음 상태로 update). full-stats `section2.guest_deposit_paid` / `guest_deposit_pending` / `guest_deposit_refunded` 3 카운트 노출.
**통합 운영 화면**. 행사 선택자 + 5개 탭.

**상단 컨트롤**:
- 행사 선택 드롭다운 (`/api/admin/events`, activeEventId 기본값)
- 새로고침 버튼
- **설정 버튼** (실제 행사 선택 시에만 노출, 'crew-all' 모드 제외) → `EventAlimtalkSettings` 모달: 탭 A "행사 정보"(장소·입장시간·준비물·당일진행·채팅방링크 입력·저장 `/api/admin/event-settings`) / 탭 B "알림톡 발송"(참석확정 2번 미발송자 일괄발송 / D-1 공지 4번 발송 / 일정·장소 변경 8번 발송 — 모두 `window.confirm` 후 `/api/admin/send-alimtalk-batch`)
- 로그아웃 버튼

> 보증금 뱃지 "미입금→입금" 클릭 시 `window.confirm`("참석 확정 알림톡 발송됩니다") → `toggle-deposit`이 행사 정보가 다 채워졌으면 2번 발송, 아니면 보류 안내 토스트. **(2026-05-20) 출석 상태 변경(출석/노쇼/미출석/해제)은 알림톡 없이 조용히 처리** — `update-status`는 noshow_count만 증감하고 문자 안 보냄. 노쇼 경고·출석 문자는 아래 컬럼별 개별 버튼으로 수동 발송.

**5개 탭**:

#### A. 체크인 탭
- 4개 StatCard: 오기로 한 인원 / 출석 / 미출석 / 노쇼확정
- 3열 그리드 (미출석 / 출석완료 / 노쇼확정) — 각 컬럼에 필터·정렬·상태 변경 (`/api/admin/update-status`, 문자 없이)
- **(2026-05-20) 컬럼별 개별 문자 버튼**: 출석완료 카드 「출석문자」(6/7번, `send-individual-alimtalk` type=checkin) / 노쇼확정 카드 「노쇼경고」(9·10번, 크루만 노출, type=noshow). 각 `window.confirm` 후 발송.
- **(2026-05-20) 자동문자 토글**: 「출석완료」 컬럼 헤더에 `자동문자 ON/OFF` 버튼 — **활성 행사(`selectedEventId === activeEventId`) 선택 시에만 노출**. ON이면 현장 체크인(/checkin) 시 출석문자 자동 발송, OFF(기본)면 스킵. `toggle-auto-checkin`이 `events.auto_checkin_alimtalk` 저장.

#### B. 팀 배정 탭
- 좌: 미배정 인원 카드 (포도=🍇/보라점, 노쇼후보 흐림, noshow_count≥2 강조). 검색창 + 그 밑에 **정렬 버튼**(가나다/학교/학년/성별/포도, `teamSort` 기본 '가나다') — 미배정·미출석·검색결과 목록에 적용
- 우: 팀 카드 그리드 (4자리 슬롯), 드래그앤드롭 + iPad 터치 선택 모드
- 팀명 직접 수정 가능
- 자동 매칭 (`/api/admin/auto-match`, teamSize 2~8) — 포도 기준 동성/나이/학교 매칭
- 팀 컴팩트화 (`/api/admin/compact-teams`) — 팀 번호 1, 2, 3... 재정렬
- 팀 초기화 (`/api/admin/reset-teams`) — ConfirmModal

#### C. 분석 탭
3개 섹션 (`/api/admin/full-stats?eventId=xxx`):
- **섹션 1** — 분포: 학교/학년/경로/성별 차트 (전체 / 일반만 토글). **(2026-06-25) 차트 막대·파이 클릭 → 해당 세그먼트 인원 명단 팝업**(학교별·학년순 정렬, 이름·🍇·성별·학년·전공·연락처 + 행사모드 출석상태 배지). `full-stats` 응답 `section1.people`로 클라이언트 필터(추가 fetch 없음). 데스크톱은 차트별 모집단(전체/크루/게스트/비포도)에 맞춰 필터, 모바일은 상단 대상 토글(`chartTarget`) 기준
- **섹션 2** — 행사별 현황 숫자: 신청, 출석, 크루 출석률, 게스트 출석률, 신규/재방문, 게스트→크루 전환, 누적 크루
- **섹션 3** — 피드백: 좋았던/아쉬운 점 태그 바 차트 + 텍스트 카드 목록

AI 보고서 영역:
- 보고서 목록 (`GET /api/admin/ai-report?eventId=xxx`)
- 인쇄 페이지로 이동 (`/admin/report?id=xxx`)
- 삭제 (`DELETE /api/admin/ai-report`)

#### D. 보증금 탭 (2026-05-06 신설)
- 게스트 사전신청·출석·노쇼 모두 포함, 중복 제거. 크루는 노출 안 함.
- 상단 통계 카드 4개: 총 게스트 / 미입금 / 입금 / 환불
- 검색 (이름·연락처·계좌번호)
- 행마다: 이름 + 포도 점 + 연락처 / 환불 계좌(없으면 "계좌 미입력" 안내) + 「수정」 → 인라인 입력으로 직접 추가·갱신 (`/api/admin/update-refund-account`) / 상태 뱃지 클릭 → 사이클 (`/api/admin/toggle-deposit`) / 「취소 알림」 버튼 → `window.confirm` 후 5번(신청 취소 확인) 알림톡 발송 (`/api/admin/send-cancel-alimtalk`). **실제 신청 행 삭제는 운영진이 신청자/멤버 탭에서 직접** (이 버튼은 알림톡만 보냄)
- 정렬: 미입금 → 입금 → 환불 순, 같은 그룹 내 가나다순

#### E. 멤버 탭
- 모드 토글: 행사 신청자 / 누적 크루 전체 (mode=all)
- 통계 카드 (성별 분포 등 — 일반만 기준)
- 검색 + 정렬, 모바일/데스크톱 분기
- 카드 확장: 전체 정보 + 포도 토글 (`/api/admin/toggle-podo`) + 삭제 (`/api/admin/delete-member`) + 첫 방문 표시

---

### 5-14. AI 보고서 뷰어 `/admin/report` ([app/admin/report/page.tsx](app/admin/report/page.tsx))
- 쿼리 `?id=xxx`로 보고서 조회 (`GET /api/admin/ai-report?id=xxx`)
- `dangerouslySetInnerHTML`로 HTML content 렌더링
- 상단 바 (인쇄 / 돌아가기) — `print:hidden`
- A4 인쇄 스타일 (마진 20mm 15mm, Pretendard, 라인하이트 1.8)
- 보라색 헤딩 border, page-break-inside avoid

> 미들웨어 보호 대상이지만 `id`만 알면 접근 가능 (외부 공유용 링크로도 활용).

---

## 6. API 라우트 목록

### 공개 API
| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | `/api/apply` | 크루 지원 (게스트→크루 마이그레이션 포함) → 3번(크루원 합류 확정) 알림톡 |
| POST | `/api/event-reg` | 행사 사전 신청 (mode: crew/guest) → 게스트는 1번(신청 접수), 크루는 행사정보 ready면 2번(참석 확정) 알림톡 |
| POST | `/api/checkin` | 현장 출석 (walkin true/false) → 팀 있으면 6번, 없으면 7번 알림톡 |
| POST | `/api/feedback` | 익명 피드백 |
| POST | `/api/admin/login` | 관리자 로그인 |
| POST | `/api/admin/logout` | 관리자 로그아웃 |

### 관리자 API (admin_session 쿠키)
| 메서드 | 경로 | 기능 |
|--------|------|------|
| GET | `/api/admin/stats` | 핵심 지표 (총 신청/출석/피드백) |
| GET | `/api/admin/funnel` | 퍼널 (신청→사전신청→출석) |
| GET | `/api/admin/by-school` | 학교별 신청/출석 |
| GET | `/api/admin/by-grade` | 학년별 신청/출석 |
| GET | `/api/admin/by-path` | 경로별 분포 |
| GET | `/api/admin/by-date` | 날짜별 추이 |
| GET | `/api/admin/feedback` | 피드백 통계 |
| GET | `/api/admin/members` | 신청자 명단 (간단) |
| GET | `/api/admin/members-list` | 신청자 명단 (상세, mode=all 옵션) |
| GET | `/api/admin/export` | CSV 내보내기 (UTF-8 BOM) |
| GET | `/api/admin/dashboard-data` | 대시보드 통합 데이터 |
| GET | `/api/admin/full-stats` | 분석 탭 3개 섹션. `section1.people`(개인 명단: 이름·학교·학년·성별·전공·연락처+`is_crew`/`is_member`/`status`)도 반환 — 차트 클릭 세그먼트 명단 팝업용 |
| GET / POST | `/api/admin/events` | 행사 목록(GET은 `auto_checkin_alimtalk` 포함 + `activeEventId`) / 행사 생성 |
| POST | `/api/admin/assign-team` | 단일 팀 배정 |
| POST | `/api/admin/auto-match` | 자동 팀 매칭 |
| POST | `/api/admin/compact-teams` | 팀 번호 재정렬 |
| POST | `/api/admin/reset-teams` | 팀 배정 초기화 |
| POST | `/api/admin/delete-member` | 멤버/등록 삭제 |
| POST | `/api/admin/toggle-podo` | 포도 상태 토글 |
| POST | `/api/admin/update-status` | 출석 상태 변경(출석완료/사전신청/노쇼확정). 노쇼확정 전환 시(크루) noshow_count +1, 해제 시 -1. **알림톡은 보내지 않음**(2026-05-20 자동 발송 로직 제거 — 사전 불참 통보자도 부담 없이 체크/해제). 노쇼 경고·출석 문자는 `send-individual-alimtalk`로 수동 |
| POST | `/api/admin/send-individual-alimtalk` | 신청자(출석) 탭 개별 문자 수동 발송. `{registration_id, type:'checkin'\|'noshow'}`. checkin→6/7번(팀 유무 분기), noshow→9번(+누적2회면 10번, 크루 한정). 2026-05-20 신설 |
| POST | `/api/admin/toggle-auto-checkin` | `{eventId, enabled}` → `events.auto_checkin_alimtalk` 토글. 활성 행사가 ON일 때만 /checkin 현장 체크인 시 출석문자 자동 발송. 2026-05-20 신설 |
| GET / POST / DELETE | `/api/admin/ai-report` | 보고서 조회/생성/삭제 |
| POST | `/api/admin/toggle-deposit` | 게스트 보증금 상태 사이클 (미입금 → 입금 → 환불 → 미입금). 미입금→입금 시 행사정보가 다 채워졌으면 2번(참석 확정) 알림톡 발송, 아니면 `alimtalk.pendingEventSettings` 응답 |
| POST | `/api/admin/update-refund-account` | 게스트 환불 계좌(event_registrations.refund_account) 직접 입력·수정 |
| POST | `/api/admin/send-cancel-alimtalk` | 5번(신청 취소 확인) 알림톡 1건 수동 발송 (보증금 탭 「취소 알림」 버튼). registration_id만 받음. 행 삭제는 별도 |
| POST | `/api/admin/add-registration` | 어드민이 크루를 행사 사전신청에 직접 추가(신청자 탭 「+ 크루 추가」 모달). `{eventId, crewId}` → event_registrations INSERT + 행사정보 ready 시 2번 크루용 확정 알림톡 자동 발송 |
| GET / POST | `/api/admin/event-settings` | 행사 정보(location/entry_time/materials/program_detail/kakao_chat_url) 조회·저장 + 알림톡 미발송자 카운트(confirm/d1) + 명단(`recipients.confirm`/`recipients.d1`: `{id, name, type, sent}`) |
| POST | `/api/admin/send-alimtalk-batch` | 일괄 발송. `template`: 'confirm'(2번, confirmReady 필수, 미발송자만) / 'd1'(4번, 미발송자만) / 'change'(8번, oldDate·oldLocation·newDate·newLocation 필요, 중복체크 없음). 선택적 `registrationIds: string[]` — 있으면 그 ID만 발송(체크박스 명단에서 일부 선택 시) |

### 카카오 알림톡 템플릿 (솔라피) — `lib/solapi.ts`의 `ALIMTALK` 맵

> 솔라피 채널: `KA01PF260511054914846rCGGdEqH9tS` (searchId `progen`). 검수 상태(2026-05-11): #5만 **APPROVED**, 나머지 9종 **INSPECTING(검수중)** — 검수 통과 전엔 발송 시 솔라피가 거부.
> `#{프로그램명}` 변수 값은 `programLabel()`이 `「행사명」`(낫표)으로 감싸서 넘김.

| # | 키 | 템플릿 코드 (솔라피 실제 ID) | 변수 | 발송 시점 |
|---|-----|------------|------|----------|
| 1 | EVENT_REG_RECEIVED | `KA01TP26051106373464071STWgjtSAK` | 이름·프로그램명·일시·장소 | `/api/event-reg` mode=guest 즉시 (장소 비면 "추후 안내") |
| 2-게스트 | EVENT_CONFIRMED | `KA01TP260511064819169WuinqHjdJcx` | 이름·프로그램명·일시·입장시간·장소·준비물·진행내용 + 버튼 `#{url}`(오픈채팅 코드) | `toggle-deposit` 미입금→입금 (게스트, ready 시) / `send-alimtalk-batch` template=confirm (대상이 게스트일 때). 본문에 보증금 환불 안내 포함 |
| 2-크루 | EVENT_CONFIRMED_CREW | `KA01TP260512222214758QYG80poi9FS` | 동일(같은 변수 셋) | `/api/event-reg` mode=crew (행사정보 ready 시) / `send-alimtalk-batch` template=confirm (대상이 크루일 때). 보증금 문구 없음 |
| 3 | CREW_CONFIRMED | `KA01TP260511070701744h8gIXOphWEW` | 이름 (버튼 고정 링크) | `/api/apply` 성공 즉시 |
| 4 | EVENT_D1_NOTICE | `KA01TP260511071006653FkF3Kf1v8lW` | 이름·프로그램명·일시·입장시간·장소·준비물 + 버튼 `#{url}`(오픈채팅 코드) | `send-alimtalk-batch` template=d1 (어드민 수동 버튼). cron 미구현 |
| 5 | REG_CANCELLED | `KA01TP260511072253259HLsKXmMYVoG` ✅승인 | 이름·프로그램명 | `send-cancel-alimtalk` (보증금 탭 「취소 알림」 버튼, 수동). 자동 취소 cron은 없음 |
| 6 | CHECKIN_WITH_TEAM | `KA01TP260511073547316F1HdnAUi1RJ` | 이름·프로그램명·팀명 | `/api/checkin` 출석완료 + team_name 있음(**활성 행사 `auto_checkin_alimtalk=true`일 때만**) / `send-individual-alimtalk` type=checkin 수동 |
| 7 | CHECKIN_NO_TEAM | `KA01TP260511075330965NCintRaUSWU` | 이름·프로그램명 | `/api/checkin` 출석완료 + team_name 없음(**활성 행사 `auto_checkin_alimtalk=true`일 때만**) / `send-individual-alimtalk` type=checkin 수동 |
| 8 | EVENT_CHANGED | `KA01TP260511073928887bmEyE8XReNZ` | 이름·프로그램명·기존일시·기존장소·변경일시·변경장소 | `send-alimtalk-batch` template=change (어드민 입력값, 중복체크 없음) |
| 9 | NOSHOW_WARNING | `KA01TP2605110744476078SNWeTQFA9a` | 이름·프로그램명 | **`send-individual-alimtalk` type=noshow 수동**(크루만). 2026-05-20부터 `update-status`는 자동 발송 안 함 |
| 10 | CREW_REVOKED | `KA01TP260511074559176oBaEuf8Dkaq` | 이름 | **`send-individual-alimtalk` type=noshow + noshow_count≥2 시 동반 발송**(크루만). update-status 자동 발송 제거됨 |

> 변수명은 한글 `#{이름}` 등 그대로 (검수 등록 형식). 단 2·4번의 채팅방 버튼 변수는 `#{url}` — 템플릿 버튼 URL이 `https://open.kakao.com/o/#{url}` 라서 `events.kakao_chat_url`에 전체 URL을 넣어도 `openChatCode()`가 코드 조각(`gXySOpui`)만 추출해 넘김. **오픈채팅(`open.kakao.com/o/...`) 링크여야 버튼이 동작** (team chat invite 링크는 불가). `sendAlimtalk()`은 빈 변수값을 공백 한 칸으로 방어. 모든 발송은 `alimtalk_logs`에 기록.

---

## 7. 인증 구조

- 쿠키 이름: `admin_session`, 값: `authenticated`
- 속성: httpOnly, secure(프로덕션), sameSite=lax, **30일 유효**
- 보호 범위 ([middleware.ts](middleware.ts)):
  - 통과: `/admin` 로그인 페이지, `/api/admin/login`, `/api/admin/logout`
  - 검증: `/admin/**`, `/api/admin/**` → 쿠키 없으면 `/admin`으로 리다이렉트

---

## 8. Supabase 클라이언트 / 라이브러리

- **[lib/supabase-admin.ts](lib/supabase-admin.ts)**: 서비스 롤 키, API 라우트 전용, RLS 우회. **클라이언트(브라우저)용 supabase 클라이언트는 없음** — 모든 DB 접근은 우리 API 라우트를 fetch 경유로만. (anon key 클라이언트가 필요해지면 RLS 정책부터 추가 후 새로 만들어야 함)
- **[lib/get-active-event.ts](lib/get-active-event.ts)**: 활성 행사 결정 로직(공통 `resolveActiveEventId(publicOnly)`). **`getActiveEventId()`(날짜 기반, 모든 행사)** — 체크인(/checkin)·피드백·어드민 기본 선택. 내부 프로젝트 회차도 날짜가 되면 활성 행사로 잡혀 현장 체크인/출석 정상 동작. **`getActivePublicEventId()`(is_public=true만)** — 웹 행사 사전신청(/event-reg) 전용, 내부 회차로 신청이 잘못 연결되는 것 차단(2026-07-08 신설). 둘 다 오늘 자정 이후 최근접 미래 행사 우선, 없으면 과거 행사 fallback은 **PAST_FALLBACK_DAYS=7일 이내**일 때만. 그 이상 지난 후 다음 행사 row가 없으면 `null` 반환 → API들이 "현재 활성 행사를 찾을 수 없습니다" 안내. 운영진의 다음 달 events row 등록 누락 시 사용자가 지난 행사로 잘못 신청되는 사고 방지 목적.
- **[lib/solapi.ts](lib/solapi.ts)** (2026-05-11): 카카오 알림톡(솔라피) 헬퍼. `ALIMTALK` 템플릿 코드 맵(10종 — ⚠️ 현재 값은 placeholder, 솔라피 실제 ID `KA01TP260511...`와 불일치. 12번 항목 참고) / `sendAlimtalk(template, phone, variables, target)` — 솔라피 v4 REST 직접 호출(Node `crypto`로 HMAC-SHA256 서명, npm 패키지 미사용) + `alimtalk_logs` 기록 / `alreadySent()` / `loadEventRow()` / `formatEventDateKo()`(Asia/Seoul) / `eventConfirmReady()` / `programLabel(title)` — `#{프로그램명}` 변수 값을 `「행사명」`(낫표)으로 감싸 강조, 비면 공백 / `varsEventRegReceived`·`varsEventConfirmed`·`varsEventD1Notice`·`varsCheckinWithTeam`·`varsCheckinNoTeam`(모두 `#{프로그램명}`에 `programLabel()` 사용). **환경변수(SOLAPI_*) 4개 미설정 시 발송 skip** — 사이트 동작 안 막음.

**RLS** (2026-04-26 잠금 적용, 2026-05-11 alimtalk_logs 추가):
- 7개 테이블 (`crew_members`, `events`, `event_registrations`, `guests`, `feedbacks`, `reports`, `alimtalk_logs`) 모두 RLS 활성화 + **정책 0개 = anon default-deny**.
- `anon` / `public` 역할로 직접 Supabase REST에 붙으면 **모든 read/insert/update/delete 차단**.
- `service_role` 키는 RLS를 우회하므로 우리 Next.js API(`createAdminClient()`)는 정상 작동.
- 결과적으로 "외부 anon key 직접 접근 = 0건" / "어드민 페이지 통한 접근 = 정상".

> **외부에서 anon key로 직접 DB 붙는 통합(Zapier/Make/외부 분석 등)이 생기면, 그때 필요한 만큼만 좁은 정책을 추가해야 함.** 현재는 그런 통합 없음.

---

## 9. 공통 유틸 ([lib/constants.ts](lib/constants.ts))

**선택지**:
- `SCHOOLS`: 11개 대학교 (2026-05-01: 충청대학교 제외)
- `GRADES`: 1~4학년, 졸업유예 (2026-05-01: 휴학 제외)
- `PATHS`: 6가지
- `PROJECTS`: 6가지
- `GENDERS`: '남성', '여성' (2가지, '선택 안함' 옵션 없음)
- `BANKS`: 21개 은행 (게스트 환불 계좌 입력용 Select, 2026-05-06 추가)
- `GOOD_TAGS`: 6개
- `BAD_TAGS`: 6개

**함수**:
- `isValidPhone(phone)`: 숫자만 추출 후 **정확히 11자리** 확인 (2026-05-01부터 10자리는 거부)
- `formatPhone(phone)`: 11자리 초과 자동 절단 + 점진적 포맷 (`010-` → `010-1234-` → `010-1234-5678`)

---

## 10. 컴포넌트

### 레이아웃
- **[Navbar](components/layout/Navbar.tsx)** — 고정 상단, 스크롤 20px 이상 시 `bg-white/95` + backdrop blur. 모바일 햄버거 fullscreen 메뉴. 메뉴: 소개/세미나/아카이브/커뮤니티/운영진모집 + 지원하기 버튼.
- **[Footer](components/layout/Footer.tsx)** — 4열 그리드 (로고/설명, NAVIGATE, CONTACT). 흰 배경.

### 홈
- **[HeroSection](components/home/HeroSection.tsx)**, **[CurriculumSection](components/home/CurriculumSection.tsx)**, **[ReviewsSection](components/home/ReviewsSection.tsx)**, **[CtaBanner](components/home/CtaBanner.tsx)**

### 공통 (2026-04-25~26 추가)
- **[Logo](components/Logo.tsx)** (2026-05-02) — `LogoMark` / `LogoWordmark` / `Logo`(둘 결합). next/image 기반, props: `size`/`height`/`variant: 'dark'|'blue'`/`gap`. PNG 자산을 `public/`에서 로드. Navbar·Footer 사용.
- **[Reveal](components/Reveal.tsx)** — IntersectionObserver 기반 스크롤 등장 wrapper. props: `delay?`, `className?`, `as?` ('div'|'section'|'article'|'li'). server component 안에서도 사용 가능 (`'use client'` 자체 선언).
- **[SpotlightBackground](components/SpotlightBackground.tsx)** — 마우스 추적 spotlight + dot grid + mesh blob 배경 wrapper. props: `variant?` ('hero'|'page'), `className?`. variant='hero'는 풀스크린 강한 그라데이션, variant='page'는 옅은 톤 + 좌우 mesh blob 2개. 홈/소개/세미나/아카이브/커뮤니티/운영진/지원/사전신청/출석/피드백 모든 페이지에 적용. server component 안에서도 사용 가능. **(2026-05-11) wrapper에 `overflow-hidden` 추가(blob이 화면 밖으로 삐져나와 모바일 가로 스크롤 유발하던 버그 수정) + mesh blob들은 `hidden lg:block`(모바일 GPU 부담↓, 모바일선 거의 안 보이는 장식). HeroSection의 mesh blob 3개도 동일. globals.css `html, body { overflow-x: hidden }`.**

### UI 기본
- **[Button](components/ui/Button.tsx)**: primary/secondary, sm/md/lg.
- **[Input](components/ui/Input.tsx)**: 라벨/에러/`phoneFormat` 옵션.
- **[Select](components/ui/Select.tsx)**: 드롭다운.

### 피드백 전용
- `TagSelector` — 태그 다중 선택

### 대시보드 전용
> 차트들(StatCard/SchoolChart/GradeChart/PathChart/DateChart/FunnelChart/FeedbackRadar/FeedbackTagChart/MembersTable)은 2026-06-25에 삭제됨 — 대시보드 페이지가 recharts를 인라인으로 직접 그려 import한 적이 없었음(데드 코드).
- **[EventAlimtalkSettings](components/dashboard/EventAlimtalkSettings.tsx)** (2026-05-11) — 대시보드 "설정" 버튼이 여는 모달. props: `isOpen`/`onClose`/`eventId`. 탭 A "행사 정보"(5개 필드 입력·저장), 탭 B "알림톡 발송"(참석확정 2번 일괄발송·D-1 4번 발송·일정변경 8번 발송, 각 `window.confirm` 후 실행). `crew-all` 모드에선 렌더 안 함.

### 기타
- `Modal` / `ConfirmModal`
- `Toast` / `ToastContainer` (전역 `showToast(message, type, duration)`)

---

## 11. 디자인 시스템 (현재 상태)

**테마**: 라이트.

**컬러** (2026-04-26: 보라 → 하늘파랑 계열로 전면 교체):
- 페이지 배경: 흰색
- 섹션 교차: `#fafafa` ↔ 흰색
- 카드 배경: 흰색
- 보더: `#eee`, `#e0e0e0`
- 본문: 검정
- 보조: `#555`, `#666`, `#888`, `#aaa`
- **포인트: `sky-500` (#0ea5e9), hover `sky-600` (#0284c7)**
- 그라데이션 보조: `blue-500` (CTA 그라데이션), `cyan-400` (FloatCard 5월/6월 카드)
- 옅은 배경: `sky-50` (배지/배너), `sky-100` (아바타 등), `sky-500` (CTA 섹션)
- 에러: `red-400`~`red-500`
- theme-color (PWA/manifest.json): `#0f1b2d` (로고 마크 배경과 통일, 2026-05-02)
- 로고 자산 (`public/`): `logo-mark.png`(다크 405×352), `logo-mark-blue.png`(블루), `logo-wordmark.png`(다크 lowercase "progen" 993×166), `logo-wordmark-blue.png`(블루), `icon.png`/`icon.svg`(favicon, 다크 마크). 워드마크는 커스텀 폰트 PNG로만 노출 — 텍스트 PRO**GEN** 표기는 폐기.

**레이아웃**:
- 최대 너비: `max-w-7xl` (메인 페이지들), 폼 페이지는 더 좁게
- 패딩: `px-5 lg:px-8` (모바일 우선)
- 라운드: `rounded-2xl` 카드, `rounded-full` 버튼/배지

**모션** (2026-04-25 추가):
- `globals.css`에 키프레임 정의: `fadeInUp`, `fadeIn`, `blobDrift`, `shimmer`
- 유틸 클래스: `.anim-fade-in-up`, `.anim-fade-in`, `.anim-blob`, `.card-lift`, `.reveal` / `.reveal.is-visible`
- **[components/Reveal.tsx](components/Reveal.tsx)**: IntersectionObserver 기반 스크롤 등장 컴포넌트. server component 안에서도 사용 가능 (자체 `'use client'`).
- 적용 위치:
  - HeroSection: 배지/타이틀/CTA에 stagger fadeInUp + violet blur 두 개에 blobDrift
  - CurriculumSection / ReviewsSection / CtaBanner: 헤더와 카드들에 Reveal (스크롤 진입 시)
  - 세미나/아카이브 페이지: 헤더에 anim-fade-in-up, 카드들에 Reveal (delay stagger)
  - 모든 카드에 `card-lift` (translateY -3px + soft violet shadow)
  - 주요 CTA 버튼에 `hover:-translate-y-0.5 + hover:shadow`
  - 아카이브 사진: hover 시 `scale-105`
- **`prefers-reduced-motion: reduce`** 환경에선 모든 애니메이션 비활성

---

## 12. 알려진 미완성 / 사용자 인지 사항

| 항목 | 상태 | 비고 |
|------|------|------|
| 카카오 알림톡 검수 | 부분 통과 | 솔라피 채널 `KA01PF260511054914846rCGGdEqH9tS`(searchId `progen`)에 템플릿 10종 등록. **#5(신청 취소 확인)만 APPROVED, 나머지 9종 INSPECTING(검수중)**. 검수중인 9종은 templateId 고쳐도 발송 시 솔라피가 거부 |
| `lib/solapi.ts` 템플릿 ID | 수정 완료 (2026-05-11) | `ALIMTALK` 맵의 templateId 10개를 솔라피 실제 ID(`KA01TP260511...`)로 교체함. (이전엔 `Rp3JMecpqY` 등 placeholder라 발송 시 "유효한 템플릿 아이디가 아닙니다") `SOLAPI_PFID`(env)는 처음부터 정상값(`KA01PF...`). 단 #5 외 9종은 검수중이라 ID는 맞아도 검수 통과 전엔 발송 안 됨 |
| 알림톡 발신 환경변수 | `SOLAPI_SENDER_PHONE` 만 미설정 | `.env.local`에 `SOLAPI_API_KEY`/`SOLAPI_API_SECRET`/`SOLAPI_PFID`는 채워짐(검증 OK). `SOLAPI_SENDER_PHONE`(=`01043232510`, 솔라피 등록 발신번호)만 빠짐 — 추가 + Vercel에도 넣어야 사이트 플로우로 발송됨 |
| 알림톡 D-1 공지(4번) 자동 발송 | 수동 | cron 없음 → 어드민 "설정" → "알림톡 발송" 탭의 "행사 전 공지 발송" 버튼으로 수동. cron(Vercel Cron 등) 도입 시 자동화 |
| 알림톡 신청 취소 확인(5번) 발송 방식 | 수동 | 보증금 탭 「취소 알림」 버튼으로 1건씩 수동 발송. "신청 후 3일 미입금 자동 취소" cron은 없음 — 운영진이 미입금자에게 버튼 누르고 신청자 탭에서 직접 삭제 |
| 알림톡 게스트 환불 완료 통지 | 없음 | 별도 템플릿 안 만듦(확정 문자에 "참석 후 환불" 문구로 갈음). 입금→환불 토글 시 알림톡 발송 안 함 |
| 알림톡 14번 게스트→크루 합류 권유 | 없음 | 광고성이라 알림톡 검수 불가 → 친구톡 필요. 미구현(피드백 완료 화면에 /apply 버튼은 이미 있음) |
| 보증금 자동 입금 확인 | 수동 | 운영진이 통장 보고 어드민에서 토글. 자동 매칭(은행 API 등) 미구현 |
| 다음 달 events row 사전 등록 운영 루틴 | 수동 | getActiveEventId가 7일 fallback 후 null → 행사 7일 이상 후 다음 행사 row 없으면 사용자 신청 차단됨. 매월 행사 종료 직후 다음 행사 row 미리 만들어야 함 |
| 홈 애니메이션/풍부함 부족 | 2026-04-25 보완 | fadeInUp + Reveal 스크롤 + blob drift + card-lift 적용 |
| 세미나 페이지 사진 | 없음 | 데이터 구조에 photo 필드 없음 |
| 4월 행사 사진 (아카이브) | 없음 | photos 빈 배열로 두면 사진 없이 정보 카드만 렌더됨 — 사진 추가 시 `/public/archive/`에 업로드 후 events 배열에 경로 추가 |
| 커뮤니티 게시판 | UI만 | 링크 `#` 처리 |
| 세미나 동적 관리 | 하드코딩 | DB 연동 미정 |
| 아카이브 동적 관리 | 하드코딩 | DB 연동 미정 |
| 운영진 지원 폼 | 없음 | 정적 안내만 |
| 크루 합격/불합격 | 없음 | status='지원완료' 고정, 즉시 확정 |
| 사전신청 폼 중복 방지 | 없음 | 기존 크루/포도가 `/event-reg/guest`(비회원 폼)로 신청하면 게스트→크루 자동 마이그레이션은 `/api/apply`에서만 동작하므로 병합 안 됨 → 같은 행사에 게스트+크루 이중 등록 발생 가능. 2026-05-18 포도 정인우(crew #194, 010-7316-5949) 1건 수동 정리(게스트 행·등록 삭제, 포도로 통합). 전수 점검상 동일 케이스 그 1명뿐. 보완안: 게스트 폼 제출 시 phone이 crew_members에 있으면 크루 경로 안내·차단 |
| 이메일 알림 | 없음 | |

---

## 13. 작업 흐름 규칙

1. **수정 전**: 이 문서를 먼저 읽고 현재 상태를 파악한다.
2. **수정 후**: 변경 내용을 즉시 이 문서에 반영한다 (페이지 구성, API, DB 컬럼, 컴포넌트, 알려진 이슈 등).
3. **사용자 직접 수정 시**: 사용자가 변경을 알려주거나 코드를 보여주면 같은 방식으로 즉시 반영한다.
4. **마지막 최신화 일자 갱신**: 최상단 줄을 업데이트한다.
5. **추측 금지**: 코드에서 확인된 사실만 적는다. 의도/계획은 12번 항목에만 둔다.

---

## 14. 기수(cohort) + 하반기 프로젝트(수료 관리) 서브시스템 (2026-06-01 신설)

> **목적**: 기존은 행사가 서로 독립이라 누적 출석을 추적할 수 없었다. 하반기 13주 프로젝트에 등록한 ~30명 크루를 **개인 출석(결석 4회까지) + 팀 결과물 기한내 제출 → 수료증** 기준으로 관리하기 위한 별도 서브시스템. 청강·게스트(클래스 단발 참여)는 기존 행사/게스트 모델 그대로 두고 수료와 무관. 기수는 **데이터 차원**(별도 URL 아님) — 어드민 상단 셀렉터로 스코프. 마이그레이션 `supabase/migrations/2026-06-01_cohort_program.sql`.

### 14-1. 데이터 모델 (9개 신규 테이블, 전부 BIGINT PK·크루 FK BIGINT·RLS 0정책 default-deny)
| 테이블 | 핵심 컬럼 | 설명 |
|--------|----------|------|
| `cohorts` | number UNIQUE, name, is_current(부분 유니크 인덱스로 1개 보장) | 기수(1기…) |
| `events.cohort_id` | BIGINT FK→cohorts | 기존 행사에 기수 부착. 기존 7건 1기 백필. NULL=기수무관 |
| `programs` | cohort_id, title, **max_absences(기본4)**, weekly_cap(1), require_deliverables(true) | 기수당 누적 프로그램 + 수료 룰 단일 출처 |
| `program_sessions` | program_id, week_no(1..13/OT·수료식 NULL), label, session_date, deadline, type(ot/class/pt/team-meeting/milestone/ceremony), **counts_for_attendance**, event_id(공식행사 연동, 부분 유니크), sort_order | 13주+OT+수료식 회차 |
| `program_teams` | program_id, name UNIQUE(program,name) | 전 주차 고정 팀 |
| `program_enrollments` | program_id, **crew_id BIGINT**, team_id, status(수강중/중도포기/수료/탈락), decided_at, UNIQUE(program,crew) | 명단. status는 운영진 확정 **스냅샷**(실시간 자격은 계산값) |
| `program_attendance` | enrollment_id, session_id, present, source(manual/checkin), evidence_url/note, UNIQUE(enrollment,session) | 매트릭스 셀(upsert) |
| `program_projects` / `program_deliverable_specs` / `program_deliverables` | project→specs→(team×spec) submitted/submitted_at/link, UNIQUE(team,spec) | 결과물 그리드 |

### 14-2. 수료 룰엔진 — `lib/program-eligibility.ts` (DB 미접근 순수함수)
- 입력: `attendanceSessionsTotal`(counts_for_attendance 주차 수=13), `presentWeeks`(주당1회 cap 적용), `maxAbsences`(=4), `requireDeliverables`, `teamDeliverables{total, submittedOnTime}`.
- 판정: `absencesUsed = total - presentWeeks`. **`absencesUsed > maxAbsences` → 수료취소** / `attendanceOk && deliverablesOk` → 수료가능 / 그 외 → 주의. `deliverablesOk = !require || (팀 모든 spec 기한내 제출)`.
- 호출: `GET /api/admin/program/roster`가 enrollment별 출석·팀 결과물 집계 → `computeEligibility()` → 배지 반환(**저장 안 함**). roster row는 등록 `status`와 계산 `eligibilityStatus`를 **별도 키로** 노출(스프레드 충돌 주의).

### 14-3. 체크인 브릿지 — `lib/program-checkin-bridge.ts`
- `markProgramAttendanceFromCheckin({supabase, eventId, crewId})`: crewId 없으면(게스트/청강) 즉시 return → **기존 체크인 동작 100% 보존**. `program_sessions.event_id=eventId` 세션 없으면 return. 그 프로그램에 `status='수강중'` 등록 크루 아니면 return. 맞으면 `program_attendance` upsert(present=true, source='checkin').
- `app/api/checkin/route.ts`: 출석 확정 3지점(walk-in UPDATE/INSERT, 일반 UPDATE)에서 `sendCheckinAlimtalk` 옆에 `bridgeProgramAttendance(supabase, eventId, crewId)` 1줄(try/catch 래핑, 체크인 흐름 비차단).

### 14-4. 어드민 페이지 `/admin/program` ([app/admin/program/page.tsx](app/admin/program/page.tsx), 단일 'use client')
- 헤더: 기수 셀렉터 + 프로그램명/룰 요약(클릭→설정 모달, `PATCH /api/admin/program`) + 「행사 대시보드」링크.
- 회차/프로젝트 없으면 **「1기 기본 일정 생성」** 버튼(13주+OT+수료식 15세션 + 프로젝트 3종·산출물 5개를 매뉴얼 기준으로 시드. 현재 라이브에 적재됨).
- 탭: ① **참가자 명단**(수료 배지·팀 select·등록상태 select·제외, 「+크루 추가」모달=members-list?mode=all에서 미등록 크루) ② **출석 매트릭스**(참가자×세션, 셀 클릭 토글, manual=초록/checkin=파랑, 행끝 남은결석, 주당1회 시각화) ③ **결과물**(팀×spec 그리드, 기한내=초록/지연=주황) ④ **팀 관리**(CRUD + 미배정 배정).
- UI: `showToast`(@/components/Toast), `Modal`/`ConfirmModal`(@/components/Modal). ToastContainer는 app/layout.tsx 전역.

### 14-5. 신규 API 라우트 (전부 `/api/admin/...`, `checkAuth` 쿠키)
`cohorts`(GET 목록+현재/POST 생성=프로그램 자동생성) · `cohorts/set-current`(POST) · `program`(GET 설정+세션/팀/프로젝트 / PATCH 룰) · `program/roster`(GET 명단+수료배지) · `program/enroll`(POST 409중복/DELETE) · `program/enrollment-status`(POST) · `program/sessions`(GET/POST/PATCH/DELETE, event 연동) · `program/attendance`(GET 매트릭스) · `program/attendance-toggle`(POST upsert) · `program/projects`(POST 프로젝트+specs/DELETE) · `program/deliverables`(GET 그리드) · `program/deliverable-toggle`(POST upsert) · `program/teams`(GET/POST/PATCH/DELETE) · `program/assign-team`(POST).

### 14-6. 기수 레트로핏 (하위호환)
- `lib/get-active-cohort.ts` `getCurrentCohortId()`: is_current → 없으면 최대 number.
- [app/api/admin/events/route.ts](app/api/admin/events/route.ts) GET: `?cohort_id` 없으면 현재 기수 필터, `=<id>` 특정, `=all` 무필터. 응답에 `cohorts`/`currentCohortId`/`effectiveCohortId` 추가(기존 소비자 무영향). POST는 현재 기수 자동 부착.
- 대시보드 헤더: 기수 드롭다운(기수 2개 이상일 때만 노출, ''=현재/숫자/all) + 「수료관리」 링크. `dashboard-data`/`full-stats`는 event_id 단위라 변경 없음(행사 셀렉터가 기수로 좁혀짐).

> **열린 항목**: 증빙은 `evidence_url`(외부 링크)만(Storage 업로드 미구현). 팀 결과물 미제출 시 팀 전원 수료 불가(require_deliverables=true). 출석 모수는 W1~13(OT/매칭데이/수료식 등 `counts_for_attendance=false`). 크루 본인 조회 페이지 없음(운영진 화면만).
