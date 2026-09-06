-- 어드민 웹푸시 구독 (2026-09-06)
-- 계정 없이 비번만 치는 어드민 구조 유지: 구독은 "기기(브라우저)" 단위.
-- 관리자가 대시보드에서 「알림 켜기」를 누르면 그 기기의 PushSubscription을 여기 저장,
-- 외부 행사 신청이 들어오면 저장된 구독 전체로 푸시 발송.
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,      -- 푸시 서비스 endpoint URL (기기 식별자 역할)
  p256dh TEXT NOT NULL,               -- 구독 암호화 공개키
  auth TEXT NOT NULL,                 -- 구독 인증 시크릿
  label TEXT,                         -- 어떤 기기인지 메모 (선택, 예: "수훈 아이폰")
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기존 테이블들과 동일: RLS 활성화 + 정책 0개 = anon default-deny (service_role만 접근)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
