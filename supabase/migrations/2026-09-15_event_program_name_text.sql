-- 알림톡 #{프로그램명} 표기 텍스트 오버라이드 (2026-09-15)
-- 비어 있으면 events.title 그대로, 입력돼 있으면 이 텍스트를 알림톡에 사용.
-- 내부 관리용 행사명과 알림톡 노출명을 다르게 쓰기 위해 신설 (datetime_text와 동일 패턴).
-- 설정 모달 「행사 정보」 탭 「알림톡 행사명 표기」 입력칸으로 편집 (event-settings GET/POST).
ALTER TABLE events ADD COLUMN IF NOT EXISTS program_name_text TEXT;
