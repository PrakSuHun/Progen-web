-- ============================================================
-- 보증금 3-상태 + 환불 계좌 (2026-05-06)
-- · deposit_paid BOOLEAN → deposit_status TEXT ('미입금'|'입금'|'환불')
-- · event_registrations.refund_account TEXT 추가 (예: "하나은행 110-123-456789")
-- ============================================================

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS deposit_status TEXT DEFAULT '미입금',
  ADD COLUMN IF NOT EXISTS refund_account TEXT;

-- 기존 BOOLEAN → TEXT 백필
UPDATE event_registrations
SET deposit_status = CASE
  WHEN deposit_paid = true THEN '입금'
  ELSE '미입금'
END
WHERE deposit_status IS NULL OR deposit_status = '미입금';

-- 인덱스 교체
DROP INDEX IF EXISTS idx_event_registrations_deposit_paid;

ALTER TABLE event_registrations
  DROP COLUMN IF EXISTS deposit_paid;

CREATE INDEX IF NOT EXISTS idx_event_registrations_deposit_status
  ON event_registrations(event_id, deposit_status)
  WHERE guest_id IS NOT NULL;

-- deposit_paid_at은 컬럼명 유지(상태가 마지막으로 바뀐 시각 의미로 확장 사용).
