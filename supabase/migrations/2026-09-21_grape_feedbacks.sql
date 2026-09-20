-- 포도용 피드백 (기명, /grapefeedback 폼)
-- 일반 행사 피드백(feedbacks, 익명)과 별도 테이블 — 질문 구조가 다름(이름 + 3문항)
CREATE TABLE IF NOT EXISTS grape_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  q1 TEXT NOT NULL DEFAULT '',  -- 생명과 친해질 수 있었나요? 어떤 부분이 도움이 되었나요?
  q2 TEXT NOT NULL DEFAULT '',  -- 애로사항이 있었나요?
  q3 TEXT NOT NULL DEFAULT '',  -- 생명을 2차 만남 혹은 이후 계획이 있으신가요?
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 다른 테이블과 동일 정책: RLS 활성화 + 정책 0개 (anon default-deny, service_role만 접근)
ALTER TABLE grape_feedbacks ENABLE ROW LEVEL SECURITY;
