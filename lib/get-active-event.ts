import { createAdminClient } from './supabase-admin'

const PAST_FALLBACK_DAYS = 7

/**
 * 활성 행사 결정 공통 로직.
 * - 오늘 자정 이후 가장 가까운 미래 행사를 우선 선택 (당일 포함)
 * - 미래 행사가 없으면, 가장 최근 과거 행사를 PAST_FALLBACK_DAYS일 이내일 때만 반환
 * - 그 외(모든 행사가 충분히 지난 후 다음 행사 row가 아직 없음)에는 null 반환
 *   → API 라우트에서 "현재 활성 행사를 찾을 수 없습니다" 안내로 이어진다.
 *   이는 "사용자 신청이 의도치 않게 지난 행사로 들어가는" 사고를 방지하기 위함.
 *
 * @param publicOnly true면 is_public=true(공개 신청 대상) 행사만 후보로 삼는다.
 */
async function resolveActiveEventId(publicOnly: boolean): Promise<string | null> {
  const supabase = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let upcomingQuery = supabase
    .from('events')
    .select('id')
    .gte('event_date', today.toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
  if (publicOnly) upcomingQuery = upcomingQuery.eq('is_public', true)

  const { data: upcoming } = await upcomingQuery.single()
  if (upcoming) return upcoming.id

  let pastQuery = supabase
    .from('events')
    .select('id, event_date')
    .lt('event_date', today.toISOString())
    .order('event_date', { ascending: false })
    .limit(1)
  if (publicOnly) pastQuery = pastQuery.eq('is_public', true)

  const { data: past } = await pastQuery.single()
  if (!past) return null

  const pastDate = new Date(past.event_date)
  const daysSince = (today.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince > PAST_FALLBACK_DAYS) return null

  return past.id
}

/**
 * 현재 활성 행사 ID(날짜 기반, 모든 행사 대상).
 * 체크인(/checkin)·피드백·어드민 기본 선택 등에 사용 — 내부 프로젝트 회차(경쟁 PT 등)도
 * 날짜가 되면 활성 행사로 잡혀 현장 체크인/출석이 정상 동작한다.
 */
export async function getActiveEventId(): Promise<string | null> {
  return resolveActiveEventId(false)
}

/**
 * 공개 신청 대상 활성 행사 ID(is_public=true 행사만).
 * 웹 행사 사전신청(/event-reg)에 사용 — 내부 회차로 신청이 잘못 연결되는 것을 막고
 * 홍보 중인 공개 행사로만 신청을 받는다.
 */
export async function getActivePublicEventId(): Promise<string | null> {
  return resolveActiveEventId(true)
}
