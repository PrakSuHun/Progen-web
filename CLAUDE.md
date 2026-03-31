# PROGEN 웹사이트 기획서 (지침서)

> **규칙**: 모든 코드 수정 전에 반드시 이 문서를 먼저 업데이트하고, 이 문서를 기반으로 작업한다.

---

## 1. 프로젝트 개요

**PROGEN**은 대전 소재 대학생을 대상으로 한 AI·자동화 커뮤니티 운영 플랫폼이다.
1기 크루 모집부터 행사 관리, 피드백 수집, 관리자 분석까지 모든 운영을 한 곳에서 처리한다.

- **프로젝트 이름**: PROGEN
- **배포 URL**: https://progen.ai.kr
- **대상**: 대전 소재 대학생 (충남대, 한남대, 배재대, KAIST 등 13개 학교)
- **1기 일정**: 3월 크루 모집 → 4월 오리엔테이션 → 5~8월 프로젝트 → 9월 최종 발표

---

## 2. 기술 스택

| 분류 | 기술 |
|------|------|
| Frontend | React 19, Next.js 15 (App Router), TypeScript |
| 스타일 | Tailwind CSS (다크 테마: slate-900 배경, purple 포인트) |
| Backend | Next.js API Routes (서버리스) |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 배포 | Vercel |
| 차트 | Recharts |
| 아이콘 | react-icons |
| 문서 | next-mdx-remote (MDX) |

---

## 3. 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL=         # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon 키
SUPABASE_SERVICE_ROLE_KEY=        # Supabase 서비스 롤 키 (서버 전용)
ADMIN_PASSWORD=                   # 관리자 로그인 비밀번호
```

> **중요**: 활성 행사는 `lib/get-active-event.ts`의 `getActiveEventId()`가 자동으로 결정한다.
> 오늘 날짜 이후의 가장 가까운 행사를 자동 선택하며, 행사 당일 포함 (자정 기준으로 다음날 전환).
> `NEXT_PUBLIC_EVENT_ID` 환경 변수는 더 이상 사용하지 않는다.

### 1기 행사 일정
| 날짜 | 주제 |
|------|------|
| 2026-03-28 | AI툴 클래스 |
| 2026-04-11 | AI로 가성비 벼락치기 |
| 2026-05-02 | AI로 만드는 자동화 |
| 2026-06-?? | AI로 영상·음악 콘텐츠 제작 |
| 2026-07-?? | AI로 나만의 캐릭터 굿즈 만들기 |
| 2026-08-?? | 백화점 플리마켓 및 1기 종료 |

> 6~8월 날짜가 확정되면 Supabase `events` 테이블에 추가하면 자동 반영된다.

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
| created_at | TIMESTAMPTZ | 지원일 |

### 4-3. guests (게스트)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| name | TEXT | 이름 |
| phone | TEXT (UNIQUE) | 연락처 (고유 식별자) |
| age | TEXT | 나이 |
| school | TEXT | 학교 |
| grade | TEXT | 학년 |
| major | TEXT | 전공 |
| path | TEXT | 알게 된 경로 |
| project | TEXT | 관심 프로젝트 |
| gender | TEXT | 성별 |
| motivation | TEXT | 참여 동기 |
| created_at | TIMESTAMPTZ | 등록일 |

> **중요**: crew_members와 동일한 필드 구조. 유입 경로 분석 및 크루 전환율 추적 목적.

### 4-4. event_registrations (행사 신청/출석)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 어느 행사인지 |
| crew_id | UUID (FK → crew_members) | 크루면 연결 |
| guest_id | UUID (FK → guests) | 게스트면 연결 |
| status | TEXT | '사전신청' 또는 '출석완료' |
| checked_in_at | TIMESTAMPTZ | 출석 시각 |
| created_at | TIMESTAMPTZ | 신청일 |

> crew_id와 guest_id 중 하나만 값이 있다.

### 4-5. feedbacks (피드백)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID (PK) | 자동 생성 |
| event_id | UUID (FK → events) | 어느 행사인지 |
| crew_id | UUID (FK → crew_members) | 크루면 연결 |
| guest_id | UUID (FK → guests) | 게스트면 연결 |
| score_overall | SMALLINT (1~5) | 전반적 만족도 |
| score_content | SMALLINT (1~5) | 강의 내용 만족도 |
| score_practice | SMALLINT (1~5) | 실습 경험 만족도 |
| score_network | SMALLINT (1~5) | 네트워킹 만족도 |
| good_tags | TEXT[] | 좋았던 점 태그 |
| good_points | TEXT | 좋았던 점 자유 의견 |
| bad_tags | TEXT[] | 아쉬운 점 태그 |
| bad_points | TEXT | 아쉬운 점 자유 의견 |
| would_return | BOOLEAN | 다음에도 참여 의향 |
| join_interest | BOOLEAN | PROGEN 가입 관심 |
| created_at | TIMESTAMPTZ | 제출일 |

---

## 5. 페이지 구조 및 로직

### 5-1. 홈 `/`
**목적**: 방문자에게 PROGEN을 소개하고 지원을 유도한다.

**구성 섹션** (순서대로):
1. `HeroSection` - 메인 타이틀, 지원하기 CTA 버튼
2. `NumbersSection` - 숫자로 보는 PROGEN (통계)
3. `AboutSection` - PROGEN 소개
4. `CurriculumSection` - 커리큘럼 소개
5. `ActivitiesSection` - 활동 소개
6. `CtaBanner` - 하단 지원 유도 배너

**특이사항**: 전체 배경에 `StarField` (별 파티클 애니메이션) 고정 표시

---

### 5-2. 소개 `/about`
**목적**: PROGEN의 비전, 특징, 1기 일정을 설명한다.

**내용**:
- 비전: 실전 프로젝트 기반 개발자 생태계
- 특징: 실전 프로젝트, 전문가 멘토링, 네트워킹, 커뮤니티
- 1기 일정: 3월(모집) → 4월(OT) → 5~8월(프로젝트) → 9월(발표)

---

### 5-3. 크루 지원 `/apply`
**목적**: 1기 크루 온라인 지원서를 받는다.

**입력 필드**:
| 필드 | 입력 방식 | 검증 |
|------|-----------|------|
| 이름 | 텍스트 | 필수 |
| 연락처 | 전화번호 (자동 포맷) | 10~11자리 숫자 |
| 학교 | 드롭다운 (13개 학교) | 필수 |
| 학년 | 드롭다운 (1~4학년, 휴학, 졸업유예) | 필수 |
| 나이 | 숫자 | 필수 |
| 전공 | 텍스트 | 필수 |
| 알게 된 경로 | 드롭다운 (6가지) | 필수 |
| 관심 프로젝트 | 드롭다운 (6가지) | 필수 |
| 성별 | 드롭다운 (남/여/선택안함) | 필수 |
| 지원 동기 | 텍스트에리어 | 필수 |

**처리 흐름**:
1. 폼 제출 → 클라이언트 검증
2. `POST /api/apply` 호출
3. 서버: 연락처(phone)로 중복 확인 → 이미 있으면 409
4. 새 레코드를 `crew_members`에 삽입 (role='participant', status='지원완료')
5. 성공 → 완료 모달 표시 (별도 선발 없음, 지원 즉시 크루 확정 → 카카오톡 팀 채팅방 입장 안내 버튼: https://invite.kakao.com/tc/Y2VGimsEqA) → 닫으면 홈으로 이동
6. 중복(409) → Toast 대신 중앙 모달 표시 (문의하기 버튼: https://open.kakao.com/o/sQqCopki)

---

### 5-4. 행사 사전 신청 `/event-reg`
**목적**: 크루 또는 게스트가 행사에 사전 신청한다.

**흐름**:
1. 페이지 진입 시 신청 유형 선택 모달 표시 (크루 / 게스트)
2. **크루 선택**: 이름 + 연락처 + 나이만 입력 (이미 지원서에 나머지 정보 있음)
3. **게스트 선택**: 지원서와 동일한 10개 필드 전부 입력 (이름, 연락처, 학교, 학년, 나이, 전공, 알게된경로, 관심프로젝트, 성별, 참여동기)

**처리 흐름**:
- **크루**: `crew_members`에서 이름+연락처로 조회 → 없으면 404 ("먼저 지원해주세요")
- **게스트**: `guests`에 upsert (연락처 기준, 전체 필드 저장) → 자동 등록
- 공통: `event_registrations`에 `status='사전신청'`으로 삽입
- 이미 신청한 경우 409 → 중앙 Modal 표시 (문의하기 버튼: https://open.kakao.com/o/sQqCopki)
- 중복 체크: DB 제약 의존 대신 insert 전 명시적으로 조회하여 확인
- 성공 → 완료 팝업 Modal 표시 후 닫으면 폼 초기화

**게스트 데이터 목적**: 유입 경로 분석, 크루 전환율 추적, 홍보 채널 효과 측정

---

### 5-5. 현장 출석체크 `/checkin`
**목적**: 행사 당일 현장에서 출석을 처리한다.

**두 가지 경로**:

**경로 A: 사전 신청자 출석**
1. 이름 + 연락처 + 나이 입력
2. `POST /api/checkin` (walkin: false)
3. 서버: `crew_members` 또는 `guests`에서 연락처로 조회
4. `event_registrations`에서 해당 행사 신청 내역 찾기
5. status를 '출석완료'로 업데이트, `checked_in_at` 기록

**경로 B: 현장 등록 (walk-in)**
- 사전 신청자 조회 실패(404) 시 자동으로 현장 등록 폼 표시
- 지원서와 동일한 10개 필드 (이름, 연락처, 학교, 학년, 나이, 전공, 경로, 관심프로젝트, 성별, 참여동기)
- `POST /api/checkin` (walkin: true)
- 서버: crew 조회 실패 시 `guests`에 upsert (전체 필드) → `event_registrations`에 status='출석완료'로 즉시 삽입

**팝업 처리**:
- 성공 → 중앙 Modal ("OOO님 출석 완료!")
- 중복 출석 (409) → 중앙 Modal ("이미 출석하셨어요")
- 404 → walk-in 폼 표시 (Toast 없음)

> **중요**: 크루도 사전 신청 없이 당일 현장 walk-in 출석 가능 (출석 인정)
> **QR 코드 방식**: `/checkin` URL을 외부 QR 생성 도구로 인쇄하여 현장 비치

---

### 5-6. 행사 피드백 `/feedback`
**목적**: 행사 종료 후 참가자의 만족도와 의견을 수집한다.

**7단계 스텝 형식**:
| 단계 | 내용 | 필수 여부 |
|------|------|-----------|
| 1 | 본인 확인 (이름, 연락처) | 필수 |
| 2 | 전반적 만족도 (별점 1~5) | 필수 |
| 3 | 세부 만족도 (강의/실습/네트워킹 각 별점) | 필수 |
| 4 | 좋았던 점 태그 선택 + 자유 의견 | 태그 필수 |
| 5 | 아쉬운 점 태그 선택 + 자유 의견 | 태그 필수 |
| 6 | 재참여 의향 + 가입 관심 (체크박스) | 선택 |
| 7 | 완료 화면 | - |

**처리 흐름**:
1. 최종 단계에서 `POST /api/feedback` 호출
2. 서버: 연락처로 crew_members → guests 순으로 조회
3. 조회 실패 시 404 (행사 참가 기록 없음)
4. `feedbacks` 테이블에 삽입
5. `join_interest=true`이면 완료 화면에서 지원하기 버튼 표시

> **QR 코드 방식**: `/feedback` URL을 외부 QR 생성 도구로 인쇄하여 행사 종료 시 배포

**좋았던 점 태그**: 좋은 강사진, 실습 경험, 네트워킹, 유용한 내용, 좋은 분위기
**아쉬운 점 태그**: 시간이 부족했음, 내용이 어려웠음, 강사 설명이 부족, 시설 부족, 기타

---

### 5-7. 세미나 `/seminar`
**목적**: 예정된 세미나 일정을 보여주고 사전 신청으로 연결한다.

**현재 상태**: 정적 데이터 (코드 내 하드코딩)
- 세미나 정보: 제목, 날짜, 발표자, 시간, 정원, 태그, 상태
- 사전 신청 버튼 → `/event-reg`로 이동
- 강의노트 버튼 → `/docs`로 이동

---

### 5-8. 아카이브 `/archive`
**목적**: 지난 행사 기록을 보여준다.

**현재 상태**: 정적 데이터 (코드 내 하드코딩)
- 행사 제목, 날짜, 장소, 참여자 수, 설명, 태그

---

### 5-9. 커뮤니티 `/community`
**목적**: 크루 커뮤니티 채널을 안내한다.

**현재 상태**: UI만 구현됨, 실제 커뮤니티 기능 미구현 (링크 `#`)
- 자유게시판, 스터디 모집, 프로젝트 공유, 아이디어 피드백 채널 안내
- 크루가 아닌 경우 지원 유도 배너 표시

---

### 5-10. 운영진 모집 `/recruit`
**목적**: 2기 운영진 모집 정보를 제공한다.

**현재 상태**: 정적 페이지
- 3개 포지션: 기획 운영진, 테크 운영진, 마케팅 운영진
- 각 포지션별 주요 업무 + 지원 자격 표시
- "1기 행사 이후 별도 공지" 안내 → `/apply` 연결

---

### 5-11. 강의노트 `/docs`
**목적**: 세미나 강의 자료를 MDX 형식으로 제공한다.

**현재 상태**: `content/docs/` 폴더에 MDX 파일 보관
- 현재 파일: `01-intro-ai-automation.mdx`

---

### 5-12. 관리자 로그인 `/admin`
**목적**: 관리자 인증 페이지.

**흐름**:
1. 비밀번호 입력 → `POST /api/admin/login`
2. 서버: `ADMIN_PASSWORD` 환경 변수와 비교
3. 일치 시 `admin_session=authenticated` httpOnly 쿠키 설정 (24시간)
4. `/admin/dashboard`로 리다이렉트

---

### 5-13. 관리자 대시보드 `/admin/dashboard`
**목적**: 행사 데이터를 시각화하여 운영 현황을 파악한다.

**인증**: `middleware.ts`가 모든 `/admin/**` 및 `/api/admin/**` 경로를 쿠키로 보호

**표시 데이터**:
| 섹션 | 차트 종류 | API |
|------|-----------|-----|
| 핵심 지표 카드 | 숫자 카드 4개 | `/api/admin/stats` |
| 신청→출석 퍼널 | 퍼널 차트 | `/api/admin/funnel` |
| 대학별 분석 | 바 차트 | `/api/admin/by-school` |
| 학년별 분석 | 바 차트 | `/api/admin/by-grade` |
| 신청 경로 분석 | 파이/바 차트 | `/api/admin/by-path` |
| 신청 시기별 출석률 | 라인 차트 | `/api/admin/by-date` |
| 만족도 레이더 | 레이더 차트 | `/api/admin/feedback` |
| 피드백 태그 분석 | 바 차트 | `/api/admin/feedback` |
| 신청자 명단 테이블 | 테이블 | `/api/admin/members` |

**기능 버튼**:
- 새로고침: 전체 데이터 재조회
- CSV 내보내기: 신청자 전체 데이터를 엑셀 호환 CSV로 다운로드
- 로그아웃: 쿠키 삭제 후 `/admin`으로 이동

**핵심 지표**:
- 총 신청자: `crew_members`에서 role='participant' 수
- 출석 인원: `event_registrations`에서 status='출석완료' 수
- 출석률: 출석 인원 / 총 신청자 × 100
- 피드백 응답: `feedbacks` 수

---

## 6. API 라우트 목록

### 공개 API (인증 불필요)
| 메서드 | 경로 | 기능 |
|--------|------|------|
| POST | `/api/apply` | 크루 지원서 제출 |
| POST | `/api/event-reg` | 행사 사전 신청 |
| POST | `/api/checkin` | 현장 출석체크 |
| POST | `/api/feedback` | 피드백 제출 |
| POST | `/api/admin/login` | 관리자 로그인 |
| POST | `/api/admin/logout` | 관리자 로그아웃 |

### 관리자 API (쿠키 인증 필요)
| 메서드 | 경로 | 기능 |
|--------|------|------|
| GET | `/api/admin/stats` | 핵심 지표 조회 |
| GET | `/api/admin/funnel` | 퍼널 데이터 |
| GET | `/api/admin/by-school` | 학교별 분석 |
| GET | `/api/admin/by-grade` | 학년별 분석 |
| GET | `/api/admin/by-path` | 경로별 분석 |
| GET | `/api/admin/by-date` | 날짜별 분석 |
| GET | `/api/admin/feedback` | 피드백 통계 |
| GET | `/api/admin/members` | 신청자 명단 |
| GET | `/api/admin/export` | CSV 내보내기 |

---

## 7. 인증 구조

**방식**: 비밀번호 기반 쿠키 인증
- 쿠키 이름: `admin_session`
- 쿠키 값: `authenticated`
- 속성: httpOnly, secure(프로덕션), sameSite=lax, 24시간 유효

**보호 범위**: `middleware.ts`가 처리
- `/admin/로그인 페이지`, `/api/admin/login`, `/api/admin/logout` → 통과
- `/admin/**`, `/api/admin/**` → 쿠키 검증 → 없으면 `/admin`으로 리다이렉트

---

## 8. Supabase 클라이언트

**두 가지 클라이언트**:
- `lib/supabase-admin.ts`: 서비스 롤 키 사용, API 라우트에서만 사용 (RLS 우회)
- `lib/supabase-browser.ts`: anon 키 사용, 클라이언트 컴포넌트에서 사용

**RLS 정책**: 모든 테이블 RLS 활성화
- events: 누구나 읽기, service role만 삽입
- crew_members, guests: 누구나 읽기/삽입
- event_registrations: 누구나 읽기/삽입/수정
- feedbacks: 누구나 읽기/삽입

---

## 9. 공통 유틸 (lib/constants.ts)

**선택지 목록**:
- `SCHOOLS`: 대전 소재 13개 대학교
- `GRADES`: 1~4학년, 휴학, 졸업유예
- `PATHS`: 알게 된 경로 6가지
- `PROJECTS`: 관심 프로젝트 6가지
- `GENDERS`: 남성, 여성, 선택 안함
- `GOOD_TAGS`: 피드백 좋았던 점 5가지
- `BAD_TAGS`: 피드백 아쉬운 점 5가지

**유틸 함수**:
- `isValidPhone(phone)`: 숫자만 추출 후 10~11자리 여부 확인
- `formatPhone(phone)`: 숫자만 추출 후 `XXX-XXXX-XXXX` 형식으로 변환

---

## 10. 공통 컴포넌트

### 레이아웃
- `Navbar`: 상단 네비게이션 (홈/소개/세미나/아카이브/커뮤니티/운영진모집/지원하기), 모바일 햄버거 메뉴 포함
- `Footer`: 하단 푸터

### UI 기본 컴포넌트
- `Button`: primary/secondary 변형, sm/md/lg 사이즈
- `Input`: 라벨, 에러 메시지, phoneFormat 옵션 (입력 중 자동 하이픈 포맷)
- `Select`: 드롭다운 선택

### 피드백 전용
- `StarRating`: 별점 1~5 선택 UI
- `StepIndicator`: 현재 단계 표시 바
- `TagSelector`: 태그 다중 선택 UI

### 대시보드 전용
- `StatCard`: 숫자 지표 카드 (primary/success/secondary/danger 컬러)
- `FunnelChart`, `SchoolChart`, `GradeChart`, `PathChart`, `DateChart`: Recharts 기반 차트
- `FeedbackRadar`: 만족도 레이더 차트
- `FeedbackTagChart`: 피드백 태그 바 차트
- `MembersTable`: 신청자 명단 테이블

### 기타
- `Modal`: 오버레이 모달
- `Toast` / `ToastContainer`: success/error/info 토스트 알림 (전역 `showToast()` 함수)
- `StarField`: 별 파티클 배경 애니메이션

---

## 11. 디자인 시스템

**컬러 팔레트**:
- 배경: `slate-900`
- 카드/섹션 배경: `slate-800`
- 보조 배경: `slate-700`
- 포인트 컬러: `purple-500`, `purple-600`
- 텍스트: `white`, `slate-300`, `slate-400`
- 에러: `red-400`

**레이아웃**:
- 최대 너비: `max-w-6xl` (일반 페이지), `max-w-7xl` (대시보드), `max-w-2xl` (폼 페이지)
- 패딩: `px-4 sm:px-6 lg:px-8`

---

## 12. 현재 미완성 / 추후 작업

| 기능 | 상태 | 비고 |
|------|------|------|
| 커뮤니티 게시판 | UI만, 기능 없음 | 링크가 `#`로 처리됨 |
| 세미나 동적 관리 | 하드코딩 | DB 연동 필요 |
| 아카이브 동적 관리 | 하드코딩 | DB 연동 필요 |
| 운영진 지원 | 정적 안내만 | 별도 지원 폼 필요 |
| 크루 상태 관리 | '지원완료' 고정 | 합격/불합격 처리 필요 |
| 이메일 알림 | 없음 | 선발 결과 안내 필요 |
| 출석 확인서 | 수동 발급 | 관리자가 연말 행사 때 직접 지급 (자동화 불필요) |
| `/admin/dashboard/full` | 존재하나 미확인 | 별도 전체 대시보드 |
