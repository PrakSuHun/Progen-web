-- ============================================================
-- 보증금 입금 추적 컬럼 추가 (2026-04-26)
-- 게스트 사전 신청 시 5,000원 노쇼 방지 보증금 도입에 따른 마이그레이션
-- ============================================================

-- event_registrations에 입금 여부/시각 컬럼 추가
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_paid_at TIMESTAMPTZ;

-- 기존 데이터 처리:
-- (1) 과거 행사의 출석완료 게스트는 이미 행사를 다녀갔으므로 보증금 정산 완료로 간주
--     → 화면 통계에서 "미입금"으로 잘못 잡히지 않도록 true 처리
-- (2) 크루 사전신청은 보증금 대상이 아님 → 컬럼은 false 유지(통계에서 제외)
-- (3) 미래 행사의 게스트 사전신청은 false 유지(운영진이 입금 확인 시 toggle)
UPDATE event_registrations
SET deposit_paid = true,
    deposit_paid_at = COALESCE(checked_in_at, registered_at)
WHERE guest_id IS NOT NULL
  AND status = '출석완료'
  AND deposit_paid = false;

-- 인덱스 (어드민 화면에서 미입금자 필터 빠르게)
CREATE INDEX IF NOT EXISTS idx_event_registrations_deposit_paid
  ON event_registrations(event_id, deposit_paid)
  WHERE guest_id IS NOT NULL;
