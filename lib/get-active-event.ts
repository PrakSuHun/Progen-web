import { createAdminClient } from './supabase-admin'

/**
 * 현재 활성 행사 ID를 자동으로 반환한다.
 * - 오늘 날짜(자정) 이후 가장 가까운 행사를 선택
 * - 행사 당일도 포함 (당일 자정부터 다음날 자정까지 해당 행사가 활성)
 * - 모든 행사가 지났으면 가장 최근 행사를 반환
 */
export async function getActiveEventId(): Promise<string | null> {
  const supabase = createAdminClient()

  // 오늘 자정 (한국 시간 기준 UTC)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 오늘 이후 가장 가까운 행사 (당일 포함)
  const { data: upcoming } = await supabase
    .from('events')
    .select('id')
    .gte('event_date', today.toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  if (upcoming) return upcoming.id

  // 모든 행사가 지난 경우 가장 최근 행사 반환
  const { data: past } = await supabase
    .from('events')
    .select('id')
    .lt('event_date', today.toISOString())
    .order('event_date', { ascending: false })
    .limit(1)
    .single()

  return past?.id ?? null
}
