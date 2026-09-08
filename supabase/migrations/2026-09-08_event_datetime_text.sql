-- 알림톡 #{일시} 표기 텍스트 오버라이드 (2026-09-08)
-- 비어 있으면 event_date를 formatEventDateKo()로 자동 포맷, 입력돼 있으면 이 텍스트를 그대로 사용.
-- 행사 시작시각과 별개로 "9/19(토) 오후 2시~5시" 같은 상세 표기가 필요해 신설.
-- 설정 모달 「행사 정보」 탭 「알림톡 일시 표기」 입력칸으로 편집 (event-settings GET/POST).
ALTER TABLE events ADD COLUMN IF NOT EXISTS datetime_text TEXT;
