// 수료 판정 룰 엔진 — DB 미접근 순수 함수.
// 입력만 받아 계산하며, 데이터 적재는 API 라우트가 담당한다.
// 설정 출처는 programs row(max_absences / require_deliverables 등).
//
// 규칙(2026-06-01 확정):
//  · 출석 인정은 "주당 1회" — presentWeeks 는 호출부에서 week 단위로 중복 제거해 넘긴다.
//  · 수료 컷 = 결석 max_absences(기본 4)회까지 허용. 초과(5회+) 시 수료취소.
//  · 수료 = 출석 충족 AND (require_deliverables 면) 팀 결과물 전부 기한내 제출.

export interface EligibilityInput {
  attendanceSessionsTotal: number // counts_for_attendance=true 인 주차 수(예 13)
  presentWeeks: number // 주당 1회 cap 적용 후 인정 출석 주차 수
  maxAbsences: number // programs.max_absences (예 4)
  requireDeliverables: boolean
  teamDeliverables: { total: number; submittedOnTime: number }
}

export interface EligibilityResult {
  absencesUsed: number
  remainingAbsenceBudget: number
  attendanceOk: boolean
  deliverablesOk: boolean
  status: '수료가능' | '주의' | '수료취소'
}

export function computeEligibility(input: EligibilityInput): EligibilityResult {
  const {
    attendanceSessionsTotal,
    presentWeeks,
    maxAbsences,
    requireDeliverables,
    teamDeliverables,
  } = input

  const cappedPresent = Math.min(presentWeeks, attendanceSessionsTotal)
  const absencesUsed = Math.max(0, attendanceSessionsTotal - cappedPresent)
  const remainingAbsenceBudget = Math.max(0, maxAbsences - absencesUsed)
  const attendanceOk = absencesUsed <= maxAbsences

  const deliverablesOk = !requireDeliverables
    ? true
    : teamDeliverables.total > 0 && teamDeliverables.submittedOnTime >= teamDeliverables.total

  let status: EligibilityResult['status']
  if (absencesUsed > maxAbsences) {
    status = '수료취소'
  } else if (attendanceOk && deliverablesOk) {
    status = '수료가능'
  } else {
    status = '주의'
  }

  return { absencesUsed, remainingAbsenceBudget, attendanceOk, deliverablesOk, status }
}
