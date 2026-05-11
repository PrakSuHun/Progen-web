-- ============================================================
-- 알림톡 발송 로그 (2026-05-11)
-- 모든 카카오 알림톡 발송 시 1행 기록.
-- "미발송자 = 해당 행사·템플릿(template_code)에 대해 status='sent' 로그가 없는 사람"
-- 으로 일괄 발송 버튼이 누구한테 보낼지 판단.
-- ============================================================

CREATE TABLE IF NOT EXISTS alimtalk_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_code     TEXT NOT NULL,                 -- 솔라피 카카오 템플릿 ID (예: 'Rp3JMecpqY')
  template_name     TEXT,                          -- 사람이 읽는 이름 (예: '행사 신청 접수')
  to_phone          TEXT NOT NULL,                 -- 수신 번호 (숫자만)
  crew_id           BIGINT REFERENCES crew_members(id) ON DELETE SET NULL,
  guest_id          UUID REFERENCES guests(id) ON DELETE SET NULL,
  registration_id   UUID REFERENCES event_registrations(id) ON DELETE SET NULL,
  event_id          UUID REFERENCES events(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'sent',  -- 'sent' | 'failed'
  solapi_message_id TEXT,                          -- 솔라피 응답 messageId (재조회용)
  error             TEXT,                          -- 실패 사유
  variables         JSONB,                         -- 발송에 쓴 치환 변수 스냅샷
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alimtalk_logs_event_template
  ON alimtalk_logs(event_id, template_code, status);

CREATE INDEX IF NOT EXISTS idx_alimtalk_logs_registration
  ON alimtalk_logs(registration_id);

CREATE INDEX IF NOT EXISTS idx_alimtalk_logs_crew
  ON alimtalk_logs(crew_id);

CREATE INDEX IF NOT EXISTS idx_alimtalk_logs_guest
  ON alimtalk_logs(guest_id);

-- RLS: 다른 테이블과 동일하게 활성화 + 정책 0개 = anon default-deny.
-- service_role(우리 Next.js API)만 접근 가능.
ALTER TABLE alimtalk_logs ENABLE ROW LEVEL SECURITY;
