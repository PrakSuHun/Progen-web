// 행사 신청 시점의 역할(크루/게스트) 판정 (2026-08-03)
//
// 배경: 과거 /api/apply 의 게스트→크루 마이그레이션이 event_registrations 의
// guest_id 를 crew_id 로 갈아치워서(현재는 제거됨), 게스트로 신청했던 행이
// 크루 신청처럼 보이는 데이터가 남아 있다 (예: 8/1 행사 당일 크루 전환 7명).
//
// 원칙: 분석·보증금·신청자 명단의 크루/게스트 구분은
// "그 행사에 신청한 시점에 크루였는가"로 고정한다.
// 크루 폼은 이미 크루인 사람만 통과하므로, 크루 가입일(crew_members.created_at)이
// 행사 신청일(registered_at)보다 늦다면 그 신청은 게스트 신청이었던 것.
export function isCrewAtRegistration(
  crewId: unknown,
  crewCreatedAt: string | null | undefined,
  registeredAt: string | null | undefined,
): boolean {
  if (!crewId) return false
  // 판정 재료가 없으면 현재 연결(crew_id 존재)을 그대로 신뢰
  if (!crewCreatedAt || !registeredAt) return true
  return new Date(crewCreatedAt).getTime() <= new Date(registeredAt).getTime()
}
