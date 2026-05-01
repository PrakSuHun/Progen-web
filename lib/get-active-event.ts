import { createAdminClient } from './supabase-admin'

const PAST_FALLBACK_DAYS = 7

/**
 * 현재 활성 행사 ID를 자동으로 반환한다.
 * - 오늘 자정 이후 가장 가까운 미래 행사를 우선 선택 (당일 포함)
 * - 미래 행사가 없으면, 가장 최근 과거 행사를 PAST_FALLBACK_DAYS일 이내일 때만 반환
 * - 그 외(모든 행사가 충분히 지난 후 다음 행사 row가 아직 없음)에는 null 반환
 *   → API 라우트에서 "현재 활성 행사를 찾을 수 없습니다" 안내로 이어진다.
 *   이는 "사용자 신청이 의도치 않게 지난 행사로 들어가는" 사고를 방지하기 위함.
 */
export async function getActiveEventId(): Promise<string | null> {
  const supabase = createAdminClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data: upcoming } = await supabase
    .from('events')
    .select('id')
    .gte('event_date', today.toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  if (upcoming) return upcoming.id

  const { data: past } = await supabase
    .from('events')
    .select('id, event_date')
    .lt('event_date', today.toISOString())
    .order('event_date', { ascending: false })
    .limit(1)
    .single()

  if (!past) return null

  const pastDate = new Date(past.event_date)
  const daysSince = (today.getTime() - pastDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince > PAST_FALLBACK_DAYS) return null

  return past.id
}
