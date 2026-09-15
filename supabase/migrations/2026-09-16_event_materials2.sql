-- 사전 공지 2차용 준비물 (2026-09-16)
-- 사전 공지(4번)를 1차/2차 두 번 보내는 운영에서 회차별 준비물 문구가 달라 분리.
-- materials = 1차 공지용(기존), materials2 = 2차 공지용(비어 있으면 1차 값으로 fallback).
-- 설정 「행사 정보」 탭 준비물 칸의 1차/2차 토글로 편집.
ALTER TABLE events ADD COLUMN IF NOT EXISTS materials2 TEXT;
