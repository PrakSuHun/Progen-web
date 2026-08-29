-- 9/19 최종 경쟁 PT를 9/18로 이동하고, 9/19 공개 외부 행사를 추가한다.
-- 경쟁 PT와 연결된 수료관리 회차 날짜도 같이 변경해 출석 기준을 맞춘다.

BEGIN;

UPDATE events
SET event_date = '2026-09-18 14:00:00+09'
WHERE id = 'f3951ccc-3a65-43d7-81e6-dff4fe4c3619';

UPDATE program_sessions
SET session_date = '2026-09-18'
WHERE event_id = 'f3951ccc-3a65-43d7-81e6-dff4fe4c3619';

INSERT INTO events (id, title, event_date, is_mandatory, is_public, cohort_id)
VALUES (
  '4f4d8487-4f59-4e2d-8216-729dad83f8d8',
  'AI시대 대학생으로 살아남기',
  '2026-09-19 14:00:00+09',
  true,
  true,
  1
)
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    event_date = EXCLUDED.event_date,
    is_mandatory = EXCLUDED.is_mandatory,
    is_public = EXCLUDED.is_public,
    cohort_id = EXCLUDED.cohort_id;

COMMIT;
