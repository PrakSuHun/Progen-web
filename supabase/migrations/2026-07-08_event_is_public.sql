-- events.is_public: 웹사이트 공개 신청/체크인/피드백 대상 여부
-- 목적: events 테이블이 공개 행사와 내부 프로젝트 회차(경쟁 PT·매칭데이·수료식 등)를 함께 담게 되면서
--       getActiveEventId()가 내부 회차를 활성 행사로 잘못 선택하는 것을 막는다.
--       is_public=false 인 행사는 활성 행사 자동 선택 대상에서 제외된다(어드민 드롭다운에는 계속 노출).
-- 기본값 true: 기존 행사 및 어드민에서 새로 만드는 행사는 공개(하위호환).

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- 하반기 프로젝트 내부 회차(공개 신청 대상 아님) 표시
UPDATE events SET is_public = false
WHERE id IN (
  'b5e92982-720f-47a8-ab88-e5f89a81fc5c', -- 2026-07-18 캐릭터 기획·시안 경쟁 PT
  'afcbe83a-04a3-4a4d-89ec-4ff1ee4407f1', -- 2026-08-21 중촌동 브랜드 매칭데이
  'c84b5585-7f79-43d7-a6f5-37ce7074d923', -- 2026-08-28 웹사이트 제작 교육
  'f3951ccc-3a65-43d7-81e6-dff4fe4c3619', -- 2026-09-19 최종 경쟁 PT
  'ebe0d08f-1186-491d-9315-74051f5bf21e'  -- 2026-11-07 수료식
);
-- 2026-08-01 "AI로 영상·음악 콘텐츠 제작"(377a011e-…)은 공개 대상이라 true 유지.
