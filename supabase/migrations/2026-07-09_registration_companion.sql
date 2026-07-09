-- event_registrations.companion: 행사 동석자(같이 오는 사람) 이름
-- 목적: 행사가 팀플로 진행되는 경우가 많아, 신청 시 함께 오는 동석자를 적게 하고
--       팀 배정 시 운영진이 참고(최대한 같은 팀 배치)한다. 자유 텍스트(여러 명은 신청자가 쉼표 등으로 구분).
--       무조건 같은 팀을 보장하지 않으며(고지), 행사 당일 팀 변경은 불가(고지).

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS companion TEXT;
