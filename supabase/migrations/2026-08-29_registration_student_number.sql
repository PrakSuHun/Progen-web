-- 행사 신청 학번: 크루·게스트 공통으로 신청 시점의 학번을 보관한다.
-- 기존 신청자는 학번을 받지 않았으므로 NULL을 허용하고, 신규 신청의 필수 검증은 API에서 한다.

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS student_number TEXT;
