# PROGEN 설정 가이드

## 1️⃣ Supabase 데이터베이스 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성 (PostgreSQL 선택)
3. 프로젝트 URL과 API 키 복사

### 1.2 데이터베이스 스키마 생성
1. Supabase 대시보드 → SQL Editor
2. `supabase/schema.sql` 파일의 전체 내용 복사
3. SQL 편집기에 붙여넣기 후 실행
4. 모든 테이블과 정책이 생성됨

### 1.3 Row Level Security (RLS) 확인
- Supabase 대시보드 → Authentication → Policies
- 모든 테이블에 RLS 정책이 설정되었는지 확인
- INSERT, SELECT, UPDATE 정책이 활성화되어 있어야 함

## 2️⃣ 환경 변수 설정

### .env.local 수정
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_key_from_supabase

# Service Role (백엔드 전용 - 절대 공개 금지!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# 행사 설정
NEXT_PUBLIC_EVENT_ID=your_event_uuid_from_supabase

# 관리자 설정
ADMIN_PASSWORD=your_secure_password_here
```

### 환경 변수 찾기
1. **NEXT_PUBLIC_SUPABASE_URL**: Supabase 대시보드 → Settings → API
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 동일 위치에서 `anon public` 키 복사
3. **SUPABASE_SERVICE_ROLE_KEY**: 동일 위치에서 `service_role` 키 복사
4. **NEXT_PUBLIC_EVENT_ID**: SQL로 events 테이블에 행사 생성 후 UUID 복사
   ```sql
   INSERT INTO events (title, event_date, is_mandatory)
   VALUES ('PROGEN 1기 모임', NOW(), true)
   RETURNING id;
   ```

## 3️⃣ 로컬 개발 시작

```bash
# 의존성 설치 (이미 완료)
npm install

# 개발 서버 시작
npm run dev

# 브라우저에서 열기
open http://localhost:3000
```

## 4️⃣ GitHub 저장소 생성 및 푸시

### GitHub 저장소 생성
1. [GitHub](https://github.com/new)에서 새 저장소 생성
2. 저장소 이름: `progen-web`
3. Public 선택 (필요시 Private)

### 로컬에서 푸시
```bash
cd /Volumes/D\ Drive/progen-web

# 리모트 추가
git remote add origin https://github.com/YOUR_USERNAME/progen-web.git

# 브랜치 이름 변경 (필요시)
git branch -M main

# 푸시
git push -u origin main
```

## 5️⃣ Vercel 배포

### 옵션 A: CLI 사용
```bash
npm install -g vercel
vercel login
vercel
```

### 옵션 B: Vercel 웹사이트
1. [Vercel](https://vercel.com)에 로그인
2. "Import Project" → GitHub 저장소 선택
3. 환경 변수 입력:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_EVENT_ID`
   - `ADMIN_PASSWORD`
4. Deploy 클릭

## 6️⃣ 배포 후 확인

### 환경 변수 확인
```bash
# Vercel 대시보드 → Settings → Environment Variables
# 모든 필수 변수가 설정되어 있는지 확인
```

### 기능 테스트
1. 홈페이지: `https://your-domain.vercel.app/`
2. 지원 페이지: `https://your-domain.vercel.app/apply`
3. 행사 신청: `https://your-domain.vercel.app/event-reg`
4. 출석 체크: `https://your-domain.vercel.app/checkin`
5. 피드백: `https://your-domain.vercel.app/feedback`
6. 관리자: `https://your-domain.vercel.app/admin`

## 🔒 보안 체크리스트

- [ ] `.env.local`가 `.gitignore`에 포함되어 있음
- [ ] `SUPABASE_SERVICE_ROLE_KEY`가 절대 public 저장소에 노출되지 않음
- [ ] `ADMIN_PASSWORD`가 강력한 비밀번호로 설정됨
- [ ] Supabase RLS 정책이 올바르게 설정됨
- [ ] Vercel 환경 변수가 모두 설정됨

## 🐛 문제 해결

### Supabase 연결 오류
```
"Failed to connect to Supabase"
```
→ `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바른지 확인

### API 오류
```
"Service role key is missing"
```
→ `.env.local`에서 `SUPABASE_SERVICE_ROLE_KEY` 확인

### 데이터베이스 오류
```
"Relation does not exist"
```
→ `supabase/schema.sql`을 Supabase SQL 에디터에서 다시 실행

## 📝 관리자 로그인

기본 경로: `/admin`

비밀번호: `.env.local`에서 설정한 `ADMIN_PASSWORD`

## 🎉 완료!

이제 PROGEN 플랫폼이 배포되었습니다!

더 자세한 내용은 `PROGEN_Feature_Code_Map.md`를 참고하세요.
