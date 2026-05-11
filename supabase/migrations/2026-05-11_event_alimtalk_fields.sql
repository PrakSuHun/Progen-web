-- ============================================================
-- 행사별 알림톡 변수용 컬럼 (2026-05-11)
-- 알림톡 템플릿의 #{장소} #{입장시간} #{준비물} #{진행내용} 변수와
-- 회차 참여자 채팅방 버튼 링크를 행사마다 운영진이 어드민에서 입력.
-- 전부 nullable — 비어 있으면 코드에서 "추후 안내" 등으로 대체 발송.
-- ============================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS location TEXT,         -- #{장소}
  ADD COLUMN IF NOT EXISTS entry_time TEXT,       -- #{입장시간} (예: "오후 1시 30분")
  ADD COLUMN IF NOT EXISTS materials TEXT,        -- #{준비물}
  ADD COLUMN IF NOT EXISTS program_detail TEXT,   -- #{진행내용} (당일 진행)
  ADD COLUMN IF NOT EXISTS kakao_chat_url TEXT;   -- 회차 참여자 채팅방 버튼 링크
