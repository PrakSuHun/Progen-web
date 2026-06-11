import { createAdminClient } from './supabase-admin'

/**
 * 현재 기수 ID를 반환한다.
 * - cohorts.is_current = true 인 기수 우선
 * - 없으면 number 가 가장 큰(최신) 기수
 * - 기수가 하나도 없으면 null
 * getActiveEventId()(날짜 기반)와 직교 — 기수는 운영진이 명시적으로 전환한다.
 */
export async function getCurrentCohortId(): Promise<number | null> {
  const supabase = createAdminClient()

  const { data: current } = await supabase
    .from('cohorts')
    .select('id')
    .eq('is_current', true)
    .limit(1)
    .maybeSingle()

  if (current) return current.id

  const { data: latest } = await supabase
    .from('cohorts')
    .select('id')
    .order('number', { ascending: false })
    .limit(1)
    .maybeSingle()

  return latest?.id ?? null
}
