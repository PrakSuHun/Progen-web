-- 크루 학번 저장 (2026-09-17)
-- 크루 지원 폼에는 학번 입력이 없지만, 행사 사전신청 시 입력한 학번을
-- 크루 프로필(crew_members)에도 저장해 사람 단위로 관리한다.
-- /api/event-reg mode=crew 가 신청 시마다 최신 값으로 갱신.
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS student_number TEXT;
