-- /checkin 자동 출석문자(6·7번) 발송 토글.
-- 활성 행사에서 ON(true)일 때만 현장 체크인 시 출석 알림톡을 자동 발송한다. 기본 false(수동).
ALTER TABLE events ADD COLUMN IF NOT EXISTS auto_checkin_alimtalk BOOLEAN NOT NULL DEFAULT false;
COMMENT ON COLUMN events.auto_checkin_alimtalk IS '/checkin 자동 출석문자(6/7번) 발송 토글. 활성 행사에서 ON일 때만 체크인 시 자동 발송. 기본 false.';
