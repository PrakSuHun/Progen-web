# PROGEN - Community Management Platform

PROGEN은 커뮤니티 1기 크루 관리 및 행사 관리를 위한 통합 플랫폼입니다.

## 기능

- **1기 크루 지원**: 온라인 지원서 접수
- **행사 사전 신청**: 행사 사전 신청 및 관리
- **현장 출석체크**: QR 코드 또는 수동 출석 체크
- **행사 피드백**: 만족도 조사 및 피드백 수집
- **관리자 대시보드**: 통계 분석 및 데이터 관리

## 기술 스택

- **Frontend**: React 19, Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## 시작하기

### 필수 요구사항
- Node.js 18+
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 입력합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_EVENT_ID=your_event_id
ADMIN_PASSWORD=your_admin_password
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요.

## 프로젝트 구조

```
progen-web/
├── app/
│   ├── api/              # API 라우트
│   ├── apply/            # 크루 지원 페이지
│   ├── about/            # 소개 페이지
│   ├── admin/            # 관리자 대시보드
│   ├── globals.css       # 전역 스타일
│   ├── layout.tsx        # 루트 레이아웃
│   └── page.tsx          # 홈페이지
├── components/           # React 컴포넌트
│   ├── layout/
│   ├── ui/
│   └── dashboard/        # 대시보드 컴포넌트
├── lib/                  # 유틸리티 함수
├── .env.local            # 환경 변수
├── next.config.js        # Next.js 설정
└── package.json
```

## 빌드 및 배포

### 빌드

```bash
npm run build
```

### Vercel에 배포

```bash
vercel
```

## 문서

자세한 기능별 코드 맵은 `PROGEN_Feature_Code_Map.md`를 참고하세요.

## 라이선스

MIT
