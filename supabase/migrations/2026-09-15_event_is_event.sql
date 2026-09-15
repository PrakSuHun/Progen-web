-- 이벤트(프로모션성) 행사 구분 플래그 (2026-09-15)
-- true = 이벤트: /admin/event 전용 어드민에서만 집계, 신청은 /event-reg/event 전용 폼(보증금 없음).
-- 이벤트 row는 is_public=false로 두어 기존 행사 신청(/event-reg)·어드민 기본선택에 안 잡힌다.
-- 일반 행사 어드민(/admin/dashboard) 목록에서는 제외된다(/api/admin/events 기본 필터).
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_event BOOLEAN NOT NULL DEFAULT false;
