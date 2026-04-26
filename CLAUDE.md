# PROGEN 웹사이트 기획서 (지침서)

> **규칙**: 모든 코드 수정 후에는 반드시 이 문서를 업데이트하고, 다음 작업은 이 문서를 기준으로 시작한다.
> 사용자가 직접 코드를 수정한 경우에도 변경 내용을 알려주면 즉시 이 문서에 반영한다.

> **보고서 작성 시**: `docs/report-general-guide.md` (대외 공개용), `docs/report-podo-guide.md` (내부 포도용) 가이드를 먼저 읽고 작성한다.

> **마지막 최신화**: 2026-04-26 (보라→하늘파랑 컬러 전면 교체, 네이버 사이트 인증)

---

## 1. 프로젝트 개요

**PROGEN**은 대전 소재 대학생을 대상으로 한 AI·자동화 커뮤니티 운영 플랫폼이다.
1기 크루 모집부터 행사 관리, 피드백 수집, 관리자 분석까지 모든 운영을 한 곳에서 처리한다.

- **프로젝트 이름**: PROGEN
- **배포 URL**: https://progen.ai.kr
- **대상**: 대전 소재 대학생 (충남대, 한남대, 배재대, KAIST 등 13개 학교)
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
| 아이콘 | react-icons |
| 문서 | next-mdx-remote (의존성만 존재, 현재 미사용) |

---

## 3. 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon 키
SUPABASE_SERVICE_ROLE_KEY=        # Supabase 서비스 롤 키 (서버 전용)
ADMIN_PASSWORD=                   # 관리자 로그인 비밀번호
```

> **활성 행사 결정**: `lib/get-active-event.ts`의 `getActiveEventId()`가 자동 처리.
> 오늘 자정 이후 가장 가까운 행사를 자동 선택. 모든 행사가 지났으면 가장 최근 행사 반환.

### 1기 커리큘럼 (홈페이지 노출 5개월, 종료 회차 포함)
| 월 | 주제 | 헤드라인 | 상태 |
|----|------|----------|------|
| 03 | AI툴 클래스 | 대학생 실전 활용 | 종료 (80명) |
| 04 | 시험공부용 AI | 중간고사 집중 대비 | 종료 (40명) |
| 05 | 일상 자동화 시스템 | 시간을 돌려받는 | 모집 중 |
| 06 | AI 숏폼과 음악 제작 | 온라인 수익화 | 예정 |
| 07 | AI 캐릭터 굿즈 제작 | 기획부터 판매까지 (신세계·롯데백화점 플리마켓 입점 협의) | 예정 |

> 종료 회차는 회색 월 박스 + opacity-75 + 회색 highlight 박스로 시각 구분 (홈/세미나 동일 스타일).

---

## 4. 데이터베이스 구조 (Supabase)

### 4-1. events (행사)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| title | TEXT | 행사 이름 |
| event_date | TIMESTAMPTZ | 행사 일시 |
| is_mandatory | BOOLEAN | 필수 참석 여부 |
| created_at | TIMESTAMPTZ | 생성일 |

### 4-2. crew_members (크루 지원자)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
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
| name | TEXT | 이름 |
| phone | TEXT (UNIQUE) | 연락처 |
| age | TEXT | 나이 |
| school | TEXT | 학교 |
| grade | TEXT | 학년 |
| major | TEXT | 전공 |
| path | TEXT | 알게 된 경로 |
| project | TEXT | 관심 프로젝트 (현재 폼 미수집) |
| gender | TEXT | 성별 |
| motivation | TEXT | 참여 동기 (현재 폼 미수집) |
| source_event_id | UUID (nullable) | 최초 유입 행사 |
| created_at | TIMESTAMPTZ | 등록일 |

> **유입 추적**: 게스트가 크루로 전환되면 동일 phone으로 crew_members 생성하면서 기존 행사 신청·피드백을 새 crew_id로 마이그레이션 (`/api/apply` 내부 로직).

### 4-4. event_registrations (행사 신청/출석)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 어느 행사인지 |
| crew_id | UUID (FK → crew_members) | 크루면 연결 |
| guest_id | UUID (FK → guests) | 게스트면 연결 |
| status | TEXT | '사전신청' / '출석완료' / '노쇼확정' |
| team_name | TEXT | 팀 배정명 (예: '1팀', null=미배정) |
| checked_in_at | TIMESTAMPTZ | 출석 시각 |
| created_at | TIMESTAMPTZ | 신청일 |

> crew_id와 guest_id 중 하나만 값이 있다.

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

---

## 5. 페이지 구조 및 로직

### 5-1. 홈 `/` ([app/page.tsx](app/page.tsx))
**구성 섹션** (현재 4개):
1. `HeroSection` — 풀스크린 히어로 (좌: 메인 카피·CTA, 우: 떠다니는 행사 미리보기 카드 4장 lg+에서만)
2. `CurriculumSection` — 5개월 커리큘럼 카드 (3·4월 종료, 5월 모집중, 6·7월 예정)
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
> **미사용 컴포넌트**: `AboutSection`, `NumbersSection`, `ActivitiesSection`, `StarField` (파일 존재, import 안 됨).

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

### 5-4. 행사 사전 신청 `/event-reg` ([app/event-reg/page.tsx](app/event-reg/page.tsx))
1. 진입 시 신청 유형 선택 모달 (크루 / 비회원)
2. **크루 폼**: 이름 + 연락처 + 나이 (3개)
3. **비회원 폼**: 이름, 성별, 연락처, 나이, 학교, 학년, 전공, 경로 (8개)
4. 하단 "← 유형 변경" 링크

**처리**:
- 크루: crew_members에서 이름+연락처 조회 → 없으면 404
- 게스트: guests에 phone 기준 upsert (신규면 source_event_id 설정)
- 공통: event_registrations에 status='사전신청' 삽입
- 중복 → 409, 중앙 Modal (문의: https://open.kakao.com/o/sQqCopki)

---

### 5-5. 현장 출석체크 `/checkin` ([app/checkin/page.tsx](app/checkin/page.tsx))
**경로 A — 사전 신청자 출석**:
1. 이름 + 연락처 입력
2. `POST /api/checkin` (walkin: false)
3. crew_members 또는 guests에서 phone 조회 → 활성 행사의 event_registrations status='출석완료' + checked_in_at
4. 응답에 `team_name` 포함 → "OOO님 출석 완료, X팀입니다" Modal

**경로 B — Walk-in**:
- 사전 신청 404 시 자동으로 walk-in 폼 표시 (8개 필드)
- `POST /api/checkin` (walkin: true) → guests upsert + event_registrations status='출석완료' 즉시 삽입

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
- 03(종료) AI툴 클래스 — 정원 80, 활동: 자료 서치 / 논문 파악 / PPT 제작 / 보고서 제작
- 04(종료) 시험공부용 AI — 참가 40명, 활동: 수업 녹음 / 시험 키워드 분석 / 시험 문제 제작 / 벼락치기 요약본
- 05(모집 중) 일상 자동화 시스템
- 06/07 (예정)
카드별: 월 박스 + 상태 배지 + 제목 + 설명 + 메타 + 태그 + 조건부 사전신청 버튼 (모집중일 때만 → /event-reg).
종료 카드는 opacity-75 + 회색 월 박스로 시각적 구분.

> **활동 중심 설명 정책**: 사용한 AI 툴 이름(다글로/NotebookLM/Scispace 등)은 영업비밀 차원에서 **외부 페이지(세미나·아카이브)에 노출하지 않는다**. 어떤 작업을 하는지(활동) 만 표기.
robots: noindex.

---

### 5-8. 아카이브 `/archive` ([app/archive/page.tsx](app/archive/page.tsx))
정적 데이터 (`events: ArchiveEvent[]`, 현재 2건):
- **2026-04-11 중간고사 집중 대비 시험공부용 AI** (참가자 40명, 충남대) — 활동: 수업 녹음 / 시험 키워드 분석 / 시험 문제 제작 / 벼락치기 요약본. 사진 2장 (`/archive/0411-1.jpeg`, `/archive/0411-2.jpeg`).
- **2026-03-28 AI툴 클래스** (참가자 80명+, 충남대) — 활동: 자료 서치 / 논문 파악 / PPT 제작 / 보고서 제작 / 팀 실습. 사진 2장 (`/archive/0328-1.JPG`, `/archive/0328-2.JPG`).

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
**통합 운영 화면**. 행사 선택자 + 4개 탭.

**상단 컨트롤**:
- 행사 선택 드롭다운 (`/api/admin/events`, activeEventId 기본값)
- 로그아웃 버튼

**4개 탭**:

#### A. 체크인 탭
- 4개 StatCard: 오기로 한 인원 / 출석 / 미출석 / 노쇼확정
- 3열 그리드 (미출석 / 출석완료 / 노쇼확정) — 각 컬럼에 필터·정렬·상태 변경 (`/api/admin/update-status`)

#### B. 팀 배정 탭
- 좌: 미배정 인원 카드 (포도=🍇/보라점, 노쇼후보 흐림, noshow_count≥2 강조)
- 우: 팀 카드 그리드 (4자리 슬롯), 드래그앤드롭 + iPad 터치 선택 모드
- 팀명 직접 수정 가능
- 자동 매칭 (`/api/admin/auto-match`, teamSize 2~8) — 포도 기준 동성/나이/학교 매칭
- 팀 컴팩트화 (`/api/admin/compact-teams`) — 팀 번호 1, 2, 3... 재정렬
- 팀 초기화 (`/api/admin/reset-teams`) — ConfirmModal

#### C. 분석 탭
3개 섹션 (`/api/admin/full-stats?eventId=xxx`):
- **섹션 1** — 분포: 학교/학년/경로/성별 차트 (전체 / 일반만 토글)
- **섹션 2** — 행사별 현황 숫자: 신청, 출석, 크루 출석률, 게스트 출석률, 신규/재방문, 게스트→크루 전환, 누적 크루
- **섹션 3** — 피드백: 좋았던/아쉬운 점 태그 바 차트 + 텍스트 카드 목록

AI 보고서 영역:
- 보고서 목록 (`GET /api/admin/ai-report?eventId=xxx`)
- 인쇄 페이지로 이동 (`/admin/report?id=xxx`)
- 삭제 (`DELETE /api/admin/ai-report`)

#### D. 멤버 탭
- 모드 토글: 행사 신청자 / 누적 크루 전체 (mode=all)
- 통계 카드 (성별 분포 등 — 일반만 기준)
- 검색 + 정렬, 모바일/데스크톱 분기
- 카드 확장: 전체 정보 + 포도 토글 (`/api/admin/toggle-podo`) + 삭제 (`/api/admin/delete-member`) + 첫 방문 표시

---

### 5-14. 전체 분석 `/admin/dashboard/full` ([app/admin/dashboard/full/page.tsx](app/admin/dashboard/full/page.tsx))
**현재**: `useRouter.replace('/admin/dashboard')`로 즉시 리다이렉트만 함. 분석은 dashboard 분석 탭에 통합됨. 빈 라우트 정리 가능.

---

### 5-15. AI 보고서 뷰어 `/admin/report` ([app/admin/report/page.tsx](app/admin/report/page.tsx))
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
| POST | `/api/apply` | 크루 지원 (게스트→크루 마이그레이션 포함) |
| POST | `/api/event-reg` | 행사 사전 신청 (mode: crew/guest) |
| POST | `/api/checkin` | 현장 출석 (walkin true/false) |
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
| GET | `/api/admin/full-stats` | 분석 탭 3개 섹션 |
| GET / POST | `/api/admin/events` | 행사 목록 / 행사 생성 |
| POST | `/api/admin/assign-team` | 단일 팀 배정 |
| POST | `/api/admin/auto-match` | 자동 팀 매칭 |
| POST | `/api/admin/compact-teams` | 팀 번호 재정렬 |
| POST | `/api/admin/reset-teams` | 팀 배정 초기화 |
| POST | `/api/admin/delete-member` | 멤버/등록 삭제 |
| POST | `/api/admin/toggle-podo` | 포도 상태 토글 |
| POST | `/api/admin/update-status` | 출석 상태 변경 |
| GET / POST / DELETE | `/api/admin/ai-report` | 보고서 조회/생성/삭제 |

---

## 7. 인증 구조

- 쿠키 이름: `admin_session`, 값: `authenticated`
- 속성: httpOnly, secure(프로덕션), sameSite=lax, **30일 유효**
- 보호 범위 ([middleware.ts](middleware.ts)):
  - 통과: `/admin` 로그인 페이지, `/api/admin/login`, `/api/admin/logout`
  - 검증: `/admin/**`, `/api/admin/**` → 쿠키 없으면 `/admin`으로 리다이렉트

---

## 8. Supabase 클라이언트 / 라이브러리

- **[lib/supabase-admin.ts](lib/supabase-admin.ts)**: 서비스 롤 키, API 라우트 전용, RLS 우회.
- **[lib/supabase-browser.ts](lib/supabase-browser.ts)**: anon 키, 클라이언트 컴포넌트 전용.
- **[lib/get-active-event.ts](lib/get-active-event.ts)**: `getActiveEventId()` — 활성 행사 결정 로직.
- **[lib/getLatestEventId.ts](lib/getLatestEventId.ts)**: created_at 기준 최신 행사 ID.

**RLS**: 모든 테이블 활성화.

---

## 9. 공통 유틸 ([lib/constants.ts](lib/constants.ts))

**선택지**:
- `SCHOOLS`: 13개 대학교
- `GRADES`: 1~4학년, 휴학, 졸업유예
- `PATHS`: 6가지
- `PROJECTS`: 6가지
- `GENDERS`: '남성', '여성' (2가지, '선택 안함' 옵션 없음)
- `GOOD_TAGS`: 6개
- `BAD_TAGS`: 6개
- `SCORE_LABELS`: 5단계 (현재 미사용 — 익명 피드백 전환 후 점수 폐기)

**함수**:
- `isValidPhone(phone)`: 숫자만 추출 후 10~11자리 확인
- `formatPhone(phone)`: `XXX-XXXX-XXXX` 형식

---

## 10. 컴포넌트

### 레이아웃
- **[Navbar](components/layout/Navbar.tsx)** — 고정 상단, 스크롤 20px 이상 시 `bg-white/95` + backdrop blur. 모바일 햄버거 fullscreen 메뉴. 메뉴: 소개/세미나/아카이브/커뮤니티/운영진모집 + 지원하기 버튼.
- **[Footer](components/layout/Footer.tsx)** — 4열 그리드 (로고/설명, NAVIGATE, CONTACT). 흰 배경.

### 홈 (사용 중)
- **[HeroSection](components/home/HeroSection.tsx)**, **[CurriculumSection](components/home/CurriculumSection.tsx)**, **[ReviewsSection](components/home/ReviewsSection.tsx)**, **[CtaBanner](components/home/CtaBanner.tsx)**

### 홈 (미사용 — 파일만 존재)
- `components/home/AboutSection.tsx`, `NumbersSection.tsx`, `ActivitiesSection.tsx`
- `components/StarField.tsx` (별 파티클 캔버스, 어디에서도 import 안 됨)

### 공통 (2026-04-25~26 추가)
- **[Reveal](components/Reveal.tsx)** — IntersectionObserver 기반 스크롤 등장 wrapper. props: `delay?`, `className?`, `as?` ('div'|'section'|'article'|'li'). server component 안에서도 사용 가능 (`'use client'` 자체 선언).
- **[SpotlightBackground](components/SpotlightBackground.tsx)** — 마우스 추적 spotlight + dot grid + mesh blob 배경 wrapper. props: `variant?` ('hero'|'page'), `className?`. variant='hero'는 풀스크린 강한 그라데이션, variant='page'는 옅은 톤 + 좌우 mesh blob 2개. 홈/소개/세미나/아카이브/커뮤니티/운영진/지원/사전신청/출석/피드백 모든 페이지에 적용. server component 안에서도 사용 가능.

### UI 기본
- **[Button](components/ui/Button.tsx)**: primary/secondary, sm/md/lg.
- **[Input](components/ui/Input.tsx)**: 라벨/에러/`phoneFormat` 옵션.
- **[Select](components/ui/Select.tsx)**: 드롭다운.

### 피드백 전용
- `StarRating` (현재 미사용)
- `StepIndicator` — 진행 단계 바
- `TagSelector` — 태그 다중 선택

### 대시보드 전용
- `StatCard`, `SchoolChart`, `GradeChart`, `PathChart`, `DateChart`, `FunnelChart`, `FeedbackRadar`, `FeedbackTagChart`, `MembersTable`

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
- theme-color (PWA/manifest.json): `#0ea5e9`

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
| 홈 애니메이션/풍부함 부족 | 2026-04-25 보완 | fadeInUp + Reveal 스크롤 + blob drift + card-lift 적용 |
| 세미나 페이지 사진 | 없음 | 데이터 구조에 photo 필드 없음 |
| 4월 행사 사진 (아카이브) | 없음 | photos 빈 배열로 두면 사진 없이 정보 카드만 렌더됨 — 사진 추가 시 `/public/archive/`에 업로드 후 events 배열에 경로 추가 |
| 커뮤니티 게시판 | UI만 | 링크 `#` 처리 |
| 세미나 동적 관리 | 하드코딩 | DB 연동 미정 |
| 아카이브 동적 관리 | 하드코딩 | DB 연동 미정 |
| 운영진 지원 폼 | 없음 | 정적 안내만 |
| 크루 합격/불합격 | 없음 | status='지원완료' 고정, 즉시 확정 |
| 이메일 알림 | 없음 | |
| `/admin/dashboard/full` | 리다이렉트만 | 빈 라우트 정리 가능 |
| StarField 컴포넌트 | 파일 존재, 미사용 | |
| AboutSection/NumbersSection/ActivitiesSection | 파일 존재, 미사용 | |

---

## 13. 작업 흐름 규칙

1. **수정 전**: 이 문서를 먼저 읽고 현재 상태를 파악한다.
2. **수정 후**: 변경 내용을 즉시 이 문서에 반영한다 (페이지 구성, API, DB 컬럼, 컴포넌트, 알려진 이슈 등).
3. **사용자 직접 수정 시**: 사용자가 변경을 알려주거나 코드를 보여주면 같은 방식으로 즉시 반영한다.
4. **마지막 최신화 일자 갱신**: 최상단 줄을 업데이트한다.
5. **추측 금지**: 코드에서 확인된 사실만 적는다. 의도/계획은 12번 항목에만 둔다.
