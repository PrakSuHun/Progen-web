import { createAdminClient } from './supabase-admin'

const PAST_FALLBACK_DAYS = 7

/**
 * 현재 활성 행사 ID를 자동으로 반환한다.
 * - is_public=true(공개 신청 대상) 행사만 고려한다. 내부 프로젝트 회차(경쟁 PT·매칭데이·
 *   수료식 등, is_public=false)는 자동 선택에서 제외 — 웹 신청/체크인/피드백이 내부 회차로
 *   잘못 연결되는 것을 막는다.
 * - 오늘 자정 이후 가장 가까운 미래 공개 행사를 우선 선택 (당일 포함)
 * - 미래 행사가 없으면, 가장 최근 과거 공개 행사를 PAST_FALLBACK_DAYS일 이내일 때만 반환
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
    .eq('is_public', true)
    .gte('event_date', today.toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  if (upcoming) return upcoming.id

  const { data: past } = await supabase
    .from('events')
    .select('id, event_date')
    .eq('is_public', true)
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
